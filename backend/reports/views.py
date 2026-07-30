from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse
from django.db.models import Sum
from django.contrib.auth import get_user_model
from datetime import date
from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from journey.models import Journey
from finances.models import Transaction, Expense
from fueling.models import Fueling

User = get_user_model()

def _get_user(request):
    if request.user.is_authenticated:
        return request.user
    user, _ = User.objects.get_or_create(id=1, defaults={'email': 'default@uber.com', 'name': 'Motorista'})
    return user

def _get_data(u, start_date, end_date):
    journeys = Journey.objects.filter(user=u, date__gte=start_date, date__lte=end_date)
    expenses = Expense.objects.filter(user=u, date__gte=start_date, date__lte=end_date)

    total_revenue = journeys.aggregate(s=Sum('total_revenue'))['s'] or 0
    total_km = journeys.aggregate(s=Sum('total_km'))['s'] or 0
    total_expenses = expenses.aggregate(s=Sum('amount'))['s'] or 0
    days_worked = journeys.filter(is_active=False).dates('date', 'day').count()
    total_hours = journeys.aggregate(s=Sum('total_hours'))['s'] or 0

    return {
        'total_revenue': float(total_revenue),
        'total_expenses': float(total_expenses),
        'net_profit': float(total_revenue - total_expenses),
        'total_km': int(total_km),
        'days_worked': days_worked,
        'avg_per_day': float(total_revenue / days_worked) if days_worked else 0,
        'avg_per_hour': float(total_revenue / total_hours) if total_hours else 0,
        'avg_per_km': float(total_revenue / total_km) if total_km else 0,
    }

class ReportView(APIView):
    def get(self, request):
        u = _get_user(request)
        start_date = request.query_params.get('start', date.today().replace(day=1).isoformat())
        end_date = request.query_params.get('end', date.today().isoformat())
        return Response(_get_data(u, start_date, end_date))

class ReportPDFView(APIView):
    def get(self, request):
        u = _get_user(request)
        start_date = request.query_params.get('start', date.today().replace(day=1).isoformat())
        end_date = request.query_params.get('end', date.today().isoformat())
        data = _get_data(u, start_date, end_date)

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm)
        styles = getSampleStyleSheet()

        elements = []
        elements.append(Paragraph(f'Relatorio {start_date} a {end_date}', styles['Title']))
        elements.append(Spacer(1, 1*cm))

        rows = [
            ['Metrica', 'Valor'],
            ['Receita Total', f'R$ {data["total_revenue"]:.2f}'],
            ['Despesas', f'R$ {data["total_expenses"]:.2f}'],
            ['Lucro Liquido', f'R$ {data["net_profit"]:.2f}'],
            ['KM Rodados', str(data['total_km'])],
            ['Dias Trabalhados', str(data['days_worked'])],
            ['Media por Dia', f'R$ {data["avg_per_day"]:.2f}'],
            ['Media por Hora', f'R$ {data["avg_per_hour"]:.2f}'],
            ['Media por KM', f'R$ {data["avg_per_km"]:.2f}'],
        ]

        table = Table(rows, colWidths=[10*cm, 8*cm])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#FBBF24')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.whitesmoke, colors.white]),
        ]))
        elements.append(table)

        doc.build(elements)
        buffer.seek(0)
        return HttpResponse(buffer, content_type='application/pdf', headers={
            'Content-Disposition': f'attachment; filename="relatorio_{start_date}_{end_date}.pdf"'
        })