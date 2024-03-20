import { Route } from '@angular/router';
import { CanDeactivateTasksDetails } from 'app/modules/admin/apps/tasks/tasks.guards';
import { TasksResolver, TasksTagsResolver, TasksTaskResolver } from 'app/modules/admin/apps/tasks/tasks.resolvers';
import { TasksComponent } from 'app/modules/admin/apps/tasks/tasks.component';
import { TasksListComponent } from 'app/modules/admin/apps/tasks/list/list.component';
import { TasksDetailsComponent } from 'app/modules/admin/apps/tasks/details/details.component';

export const tasksRoutes: Route[] = [
    {
        path: '',
        component: TasksComponent
    }
];
