from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from django.contrib.auth import get_user_model
from datetime import date, timedelta
from journey.models import Journey
from finances.models import Transaction, Expense, Goal
from fueling.models import Fueling

User = get_user_model()

def _get_user(request):
    if request.user.is_authenticated:
        return request.user
    user, _ = User.objects.get_or_create(id=1, defaults={'email': 'default@uber.com', 'name': 'Motorista'})
    return user

class DashboardView(APIView):
    def get(self, request):
        u = _get_user(request)
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        month_start = today.replace(day=1)

        all_journeys = Journey.objects.filter(user=u)
        today_data = all_journeys.filter(date=today)
        week_data = all_journeys.filter(date__gte=week_start)
        month_data = all_journeys.filter(date__gte=month_start)

        today_revenue = today_data.aggregate(s=Sum('total_revenue'))['s'] or 0
        week_revenue = week_data.aggregate(s=Sum('total_revenue'))['s'] or 0
        month_revenue = month_data.aggregate(s=Sum('total_revenue'))['s'] or 0
        today_km = today_data.aggregate(s=Sum('total_km'))['s'] or 0

        month_expenses = Expense.objects.filter(user=u, date__gte=month_start).aggregate(s=Sum('amount'))['s'] or 0
        month_fuel = Fueling.objects.filter(user=u, date__gte=month_start).aggregate(s=Sum('amount'))['s'] or 0
        total_fuel = Fueling.objects.filter(user=u).aggregate(s=Sum('amount'))['s'] or 0

        daily_revenue = list(month_data.values('date').annotate(revenue=Sum('total_revenue')).order_by('date')[:30])

        daily_goal = Goal.objects.filter(user=u, type='daily').first()
        daily_progress = (float(today_revenue) / float(daily_goal.target_amount) * 100) if daily_goal and daily_goal.target_amount > 0 else 0

        return Response({
            'today_revenue': float(today_revenue),
            'week_revenue': float(week_revenue),
            'month_revenue': float(month_revenue),
            'today_km': int(today_km),
            'net_profit': float(month_revenue - month_expenses - month_fuel),
            'total_fuel': float(total_fuel),
            'daily_goal': float(daily_goal.target_amount) if daily_goal else 0,
            'daily_progress': round(daily_progress, 1),
            'daily_revenue': daily_revenue,
        })