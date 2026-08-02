from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/vehicle/', include('vehicle.urls')),
    path('api/journeys/', include('journey.urls')),
    path('api/finances/', include('finances.urls')),
    path('api/fueling/', include('fueling.urls')),
    path('api/maintenance/', include('maintenance.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/quotes/', include('quotes.urls')),
]