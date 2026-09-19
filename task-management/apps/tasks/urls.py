from django.urls import path
from .views import task_list, task_detail

urlpatterns = [
    path('tasks/', task_list, name='task-list'),
    path('tasks/<int:task_id>/', task_detail, name='task-detail'),
]