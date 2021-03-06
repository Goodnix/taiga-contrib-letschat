# Copyright (C) 2014 Andrey Antukh <niwi@niwi.be>
# Copyright (C) 2014 Jesús Espino <jespinog@gmail.com>
# Copyright (C) 2014 David Barragán <bameda@dbarragan.com>
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

from django.conf import settings

from taiga.projects.history import services as history_service
from taiga.projects.history.choices import HistoryType

from . import tasks


def _get_project_letschathooks(project):
    letschathooks = []
    for letschathook in project.letschathooks.all():
        letschathooks.append({
            "id": letschathook.pk,
            "url": letschathook.url,
            "token": letschathook.token,
        })
    return letschathooks


def on_new_history_entry(sender, instance, created, **kwargs):
    if instance.is_hidden:
        return None

    model = history_service.get_model_from_key(instance.key)
    pk = history_service.get_pk_from_key(instance.key)
    obj = model.objects.get(pk=pk)

    letschathooks = _get_project_letschathooks(obj.project)

    if instance.type == HistoryType.create:
        task = tasks.create_letschathook
        extra_args = []
    elif instance.type == HistoryType.change:
        task = tasks.change_letschathook
        extra_args = [instance]
    elif instance.type == HistoryType.delete:
        task = tasks.delete_letschathook
        extra_args = []

    for letschathook in letschathooks:
        args = [letschathook["url"], letschathook["token"], obj] + extra_args

        if settings.CELERY_ENABLED:
            task.delay(*args)
        else:
            task(*args)
