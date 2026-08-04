from rest_framework import generics, views, status
from rest_framework.response import Response
from django.http import HttpResponse
from django.contrib.auth import get_user_model
from io import BytesIO
import base64
import re
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.utils import ImageReader
from PIL import Image as PILImage

# --- Posicionamento ajustavel da arte de fundo (altere os valores abaixo) ---
ART_COVER = True          # True: a arte cobre a pagina toda (corta excedente). False: ajusta sem cortar.
ART_MARGIN_PT = 0         # margem extra (pontos) ao redor da arte quando ART_COVER=False
CONTENT_TOP_PT = 150      # distancia (pontos) do topo onde o conteudo (nome/rotas/valores) comeca a ser impresso

from .models import PrivateQuote
from .serializers import PrivateQuoteSerializer
from .services import geocode, route, render_map, TILE_ATTRIBUTION

User = get_user_model()


def _get_user(request):
    if request.user.is_authenticated:
        return request.user
    user, _ = User.objects.get_or_create(id=1, defaults={'email': 'default@uber.com', 'name': 'Motorista'})
    return user


def _decode_art(art):
    """Decodifica arte base64 (data URL) em bytes. Converte PDF (1a pagina) para PNG."""
    if not art:
        return None
    raw = art.split(',', 1)[-1]
    try:
        data = base64.b64decode(raw)
    except Exception:
        return None
    if data[:5] == b'%PDF-':
        try:
            import fitz
            with fitz.open(stream=data, filetype='pdf') as doc:
                pix = doc[0].get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
                return pix.tobytes('png')
        except Exception:
            return None
    return data


def _art_background(art_bytes):
    """Retorna callable (canvas, doc) que desenha a arte como fundo de pagina."""
    if not art_bytes:
        return None

    def draw(canvas, doc):
        try:
            reader = ImageReader(BytesIO(art_bytes))
            iw, ih = reader.getSize()
            pw, ph = doc.pagesize
            avail_w = pw - 2 * ART_MARGIN_PT
            avail_h = ph - 2 * ART_MARGIN_PT
            if ART_COVER:
                scale = max(avail_w / iw, avail_h / ih)
            else:
                scale = min(avail_w / iw, avail_h / ih)
            dw, dh = iw * scale, ih * scale
            x = (pw - dw) / 2
            y = (ph - dh) / 2
            canvas.drawImage(reader, x, y, width=dw, height=dh)
        except Exception:
            pass

    return draw


class QuoteListCreateView(generics.ListCreateAPIView):
    serializer_class = PrivateQuoteSerializer

    def get_queryset(self):
        return PrivateQuote.objects.filter(user=_get_user(self.request))

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        origin = data.get('origin', '')
        destination = data.get('destination', '')

        origin_geo = geocode(origin)
        dest_geo = geocode(destination)

        manual_km = data.get('distance_km')

        if origin_geo:
            data['origin_lat'] = origin_geo['lat']
            data['origin_lon'] = origin_geo['lon']
        if dest_geo:
            data['dest_lat'] = dest_geo['lat']
            data['dest_lon'] = dest_geo['lon']

        if origin_geo and dest_geo and not manual_km:
            route_data = route(origin_geo, dest_geo)
            if route_data:
                data['distance_km'] = route_data['distance_km']

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=_get_user(self.request))
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class QuoteCalculateView(views.APIView):
    def post(self, request):
        origin = request.data.get('origin', '')
        destination = request.data.get('destination', '')
        if not origin or not destination:
            return Response({'error': 'Informe origem e destino'}, status=400)
        origin_geo = geocode(origin)
        dest_geo = geocode(destination)
        if not origin_geo or not dest_geo:
            return Response({'error': 'Nao foi possivel localizar os enderecos'}, status=400)
        route_data = route(origin_geo, dest_geo)
        if not route_data:
            return Response({'error': 'Nao foi possivel calcular a rota'}, status=400)
        return Response({
            'distance_km': round(route_data['distance_km'], 2),
            'duration_min': route_data.get('duration_min'),
            'origin_lat': origin_geo['lat'],
            'origin_lon': origin_geo['lon'],
            'dest_lat': dest_geo['lat'],
            'dest_lon': dest_geo['lon'],
        })


class QuoteRetrieveDestroyView(generics.RetrieveDestroyAPIView):
    serializer_class = PrivateQuoteSerializer

    def get_queryset(self):
        return PrivateQuote.objects.filter(user=_get_user(self.request))


class QuotePDFView(views.APIView):
    def get(self, request, pk):
        u = _get_user(request)
        quote = PrivateQuote.objects.filter(pk=pk, user=u).first()
        if not quote:
            return Response({'error': 'Orcamento nao encontrado'}, status=404)

        from vehicle.models import Vehicle
        from accounts.models import UserSettings

        vehicle = Vehicle.objects.filter(user=u).first()
        settings_obj, _ = UserSettings.objects.get_or_create(user=u)
        phone = getattr(settings_obj, 'phone', '') or ''

        map_bytes = None
        if quote.origin_lat and quote.dest_lat:
            origin_geo = {'lat': float(quote.origin_lat), 'lon': float(quote.origin_lon)}
            dest_geo = {'lat': float(quote.dest_lat), 'lon': float(quote.dest_lon)}
            route_data = route(origin_geo, dest_geo) if quote.distance_km else None
            geometry = route_data['geometry'] if route_data else None
            map_bytes = render_map(origin_geo, dest_geo, geometry)

        buffer = BytesIO()
        art_bytes = _decode_art(getattr(settings_obj, 'quote_art', '') or '') if settings_obj else None
        art_bg = _art_background(art_bytes)
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            topMargin=CONTENT_TOP_PT,
            bottomMargin=1.5 * cm,
        )
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle('QuoteTitle', parent=styles['Title'], textColor=colors.HexColor('#111827'), fontSize=20, spaceAfter=4)
        sub_style = ParagraphStyle('QuoteSub', parent=styles['Normal'], textColor=colors.HexColor('#6B7280'), fontSize=10, spaceAfter=2)
        label_style = ParagraphStyle('Label', parent=styles['Normal'], textColor=colors.HexColor('#6B7280'), fontSize=9)
        value_style = ParagraphStyle('Value', parent=styles['Normal'], textColor=colors.HexColor('#111827'), fontSize=12)

        elements = []

        driver_name = u.name or 'Motorista'

        photo_img = None
        if vehicle and vehicle.photo:
            try:
                raw = base64.b64decode(vehicle.photo.split(',', 1)[-1])
                with PILImage.open(BytesIO(raw)) as im:
                    pw, ph = im.size
                max_w, max_h = 4.8 * cm, 3.4 * cm
                ratio = min(max_w / pw, max_h / ph)
                photo_img = Image(BytesIO(raw), width=pw * ratio, height=ph * ratio)
            except Exception:
                photo_img = None

        header_rows = []
        left_cell = []
        left_cell.append(Paragraph('Orcamento de Corrida Particular', title_style))
        contact_parts = [f'<b>{driver_name}</b>']
        if phone:
            contact_parts.append(f'<b>{phone}</b>')
        if vehicle:
            contact_parts.append(f'{vehicle.model} {vehicle.year} - {vehicle.plate}'.strip())
        left_cell.append(Paragraph('  |  '.join(contact_parts), sub_style))
        left_cell.append(Paragraph(f'Cliente: <b>{quote.client_name}</b>', sub_style))
        left_cell.append(Paragraph(f'Data: {quote.created_at.strftime("%d/%m/%Y %H:%M")}', sub_style))
        header_rows.append([left_cell, photo_img if photo_img else ''])
        header_table = Table(header_rows, colWidths=[12.5 * cm, 4.5 * cm])
        header_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FBBF24')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#FBBF24')),
        ]))
        elements.append(header_table)
        elements.append(Spacer(1, 0.7 * cm))

        if map_bytes:
            try:
                img = Image(BytesIO(map_bytes), width=17*cm, height=9.4*cm)
                elements.append(img)
                elements.append(Spacer(1, 0.5*cm))
            except Exception:
                pass

        rows = [
            [Paragraph('Origem', label_style), Paragraph(quote.origin, value_style)],
            [Paragraph('Destino', label_style), Paragraph(quote.destination, value_style)],
            [Paragraph('Distancia', label_style), Paragraph(f'{quote.distance_km} km' if quote.distance_km else '—', value_style)],
            [Paragraph('Valor em Dinheiro / Pix', label_style), Paragraph(f'R$ {quote.price_cash_pix:.2f}'.replace('.', ','), value_style)],
            [Paragraph('Valor no Cartao', label_style), Paragraph(f'R$ {quote.price_card:.2f}'.replace('.', ','), value_style)],
        ]
        if quote.notes:
            rows.append([Paragraph('Observacoes', label_style), Paragraph(quote.notes, value_style)])

        info_table = Table(rows, colWidths=[5*cm, 12*cm])
        info_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F3F4F6')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#D1D5DB')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 1*cm))

        footer = [Paragraph(f'Atenciosamente,', sub_style),
                  Paragraph(f'{driver_name}{"  -  " + phone if phone else ""}', value_style)]
        if vehicle:
            footer.append(Paragraph(f'{vehicle.model} {vehicle.year} - {vehicle.plate}', sub_style))
        for item in footer:
            elements.append(item)

        if map_bytes:
            elements.append(Spacer(1, 0.6 * cm))
            elements.append(Paragraph(TILE_ATTRIBUTION, sub_style))

        doc.build(elements, onFirstPage=art_bg, onLaterPages=art_bg)
        buffer.seek(0)
        safe_name = re.sub(r'[^\w\s-]', '', quote.client_name).strip().replace(' ', '_') or 'orcamento'
        fname = f'orcamento_{safe_name}.pdf'
        return HttpResponse(buffer, content_type='application/pdf', headers={
            'Content-Disposition': f'attachment; filename="{fname}"'
        })
