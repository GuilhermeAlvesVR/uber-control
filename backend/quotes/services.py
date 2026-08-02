import io
import requests
from decimal import Decimal

NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
OSRM_URL = 'https://router.project-osrm.org/route/v1/driving'
TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
USER_AGENT = 'ControleUberQuote/1.0'


def geocode(address):
    if not address:
        return None
    try:
        r = requests.get(
            NOMINATIM_URL,
            params={'format': 'json', 'q': address, 'limit': 1},
            headers={'User-Agent': USER_AGENT},
            timeout=10,
        )
        r.raise_for_status()
        results = r.json()
        if not results:
            return None
        item = results[0]
        return {
            'lat': Decimal(str(item['lat'])),
            'lon': Decimal(str(item['lon'])),
            'display_name': item.get('display_name', address),
        }
    except Exception:
        return None


def route(origin, destination):
    try:
        url = f"{OSRM_URL}/{origin['lon']},{origin['lat']};{destination['lon']},{destination['lat']}"
        r = requests.get(url, params={'overview': 'full', 'geometries': 'geojson'}, timeout=15)
        r.raise_for_status()
        data = r.json()
        if data.get('code') != 'Ok' or not data.get('routes'):
            return None
        route_data = data['routes'][0]
        return {
            'distance_km': Decimal(str(round(route_data.get('distance', 0) / 1000, 2))),
            'geometry': route_data.get('geometry', {}).get('coordinates', []),
        }
    except Exception:
        return None


def render_map(origin, destination, geometry):
    try:
        from staticmap import StaticMap, CircleMarker, Line

        m = StaticMap(760, 420, padding_x=40, padding_y=40, url_template=TILE_URL)

        if geometry:
            coords = [(lon, lat) for lon, lat in geometry]
            m.add_line(Line(coords, '#3B82F6', 5))

        origin_marker = CircleMarker((float(origin['lon']), float(origin['lat'])), '#F59E0B', 14)
        origin_outline = CircleMarker((float(origin['lon']), float(origin['lat'])), '#FFFFFF', 20)
        dest_marker = CircleMarker((float(destination['lon']), float(destination['lat'])), '#EF4444', 14)
        dest_outline = CircleMarker((float(destination['lon']), float(destination['lat'])), '#FFFFFF', 20)

        m.add_marker(origin_outline)
        m.add_marker(origin_marker)
        m.add_marker(dest_outline)
        m.add_marker(dest_marker)

        image = m.render()
        buf = io.BytesIO()
        image.save(buf, format='PNG')
        buf.seek(0)
        return buf.read()
    except Exception:
        return None
