import io
import requests
from decimal import Decimal

NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
OSRM_URL = 'https://router.project-osrm.org/route/v1/driving'
TILE_URL = 'https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png'
TILE_ATTRIBUTION = 'Map tiles: CARTO (CC BY 3.0) - OpenStreetMap (ODbL)'
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
            'duration_min': int(route_data.get('duration', 0) // 60),
            'geometry': route_data.get('geometry', {}).get('coordinates', []),
        }
    except Exception:
        return None


def render_map(origin, destination, geometry):
    try:
        from staticmap import StaticMap, CircleMarker, Line

        m = StaticMap(1400, 780, padding_x=60, padding_y=60, url_template=TILE_URL)

        if geometry:
            coords = [(lon, lat) for lon, lat in geometry]
            m.add_line(Line(coords, '#FFFFFF', 14))
            m.add_line(Line(coords, '#2563EB', 8))

        origin_outline = CircleMarker((float(origin['lon']), float(origin['lat'])), '#FFFFFF', 34)
        origin_marker = CircleMarker((float(origin['lon']), float(origin['lat'])), '#F59E0B', 24)
        dest_outline = CircleMarker((float(destination['lon']), float(destination['lat'])), '#FFFFFF', 34)
        dest_marker = CircleMarker((float(destination['lon']), float(destination['lat'])), '#DC2626', 24)

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
