import json
from datetime import datetime

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import Task


def _serialize_task(task):
    return {
        "id": task.id,
        "title": task.title,
        "brief": task.brief,
        "assignee": task.assignee,
        "project": task.project,
        "due_date": task.due_date.isoformat() if task.due_date else None,
        "priority": task.priority,
        "priority_label": task.get_priority_display(),
        "status": task.status,
        "status_label": task.get_status_display(),
        "created_by_id": task.created_by_id,
        "created_by_name": task.created_by.name if task.created_by else None,
        "created_at": task.created_at.isoformat(),
        "updated_at": task.updated_at.isoformat(),
    }


def _authenticated_user(request):
    from apps.task_user.models import TaskUser

    user_id = request.session.get("user_id")
    if not user_id:
        return None
    return TaskUser.objects.filter(id=user_id).first()


def _parse_due_date(value):
    if value in (None, ""):
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None


@csrf_exempt
@require_http_methods(["GET", "POST"])
def task_list(request):
    user = _authenticated_user(request)
    if not user:
        return JsonResponse({"message": "Not authenticated"}, status=401)

    if request.method == "GET":
        tasks = Task.objects.all()
        return JsonResponse(
            {"tasks": [_serialize_task(task) for task in tasks]},
            status=200,
        )

    data = json.loads(request.body)

    title = (data.get("title") or "").strip()
    if not title:
        return JsonResponse({"message": "Title is required."}, status=400)

    priority = (data.get("priority") or Task.Priority.MEDIUM).upper()
    status = (data.get("status") or Task.Status.TODO).upper()
    if priority not in Task.Priority.values or status not in Task.Status.values:
        return JsonResponse({"message": "Invalid priority or status."}, status=400)

    due_date = _parse_due_date(data.get("due_date"))
    if data.get("due_date") and due_date is None:
        return JsonResponse({"message": "Due date must use YYYY-MM-DD format."}, status=400)

    task = Task.objects.create(
        title=title,
        brief=(data.get("brief") or "").strip(),
        assignee=(data.get("assignee") or "").strip(),
        project=(data.get("project") or "").strip(),
        due_date=due_date,
        priority=priority,
        status=status,
        created_by=user,
    )
    return JsonResponse({"task": _serialize_task(task)}, status=201)


@csrf_exempt
@require_http_methods(["GET", "PATCH", "DELETE"])
def task_detail(request, task_id):
    user = _authenticated_user(request)
    if not user:
        return JsonResponse({"message": "Not authenticated"}, status=401)

    try:
        task = Task.objects.get(id=task_id)
    except Task.DoesNotExist:
        return JsonResponse({"message": "Task not found."}, status=404)

    if request.method == "GET":
        return JsonResponse({"task": _serialize_task(task)}, status=200)

    if request.method == "DELETE":
        title = task.title
        task.delete()
        return JsonResponse({"message": f"Task \"{title}\" deleted."}, status=200)

    data = json.loads(request.body)
    updated = False

    if "title" in data:
        title = (data.get("title") or "").strip()
        if not title:
            return JsonResponse({"message": "Title is required."}, status=400)
        task.title = title
        updated = True
    if "brief" in data:
        task.brief = (data.get("brief") or "").strip()
        updated = True
    if "assignee" in data:
        task.assignee = (data.get("assignee") or "").strip()
        updated = True
    if "project" in data:
        task.project = (data.get("project") or "").strip()
        updated = True
    if "due_date" in data:
        due_date = _parse_due_date(data.get("due_date"))
        if data.get("due_date") and due_date is None:
            return JsonResponse({"message": "Due date must use YYYY-MM-DD format."}, status=400)
        task.due_date = due_date
        updated = True
    if "priority" in data:
        priority = (data.get("priority") or "").upper()
        if priority not in Task.Priority.values:
            return JsonResponse({"message": "Invalid priority."}, status=400)
        task.priority = priority
        updated = True
    if "status" in data:
        status = (data.get("status") or "").upper()
        if status not in Task.Status.values:
            return JsonResponse({"message": "Invalid status."}, status=400)
        task.status = status
        updated = True

    if not updated:
        return JsonResponse({"message": "No valid fields to update."}, status=400)

    task.save()
    return JsonResponse({"task": _serialize_task(task)}, status=200)