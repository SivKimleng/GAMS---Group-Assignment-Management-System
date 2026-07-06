import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'GAMS API',
    version: '1.0.0',
    description: 'Group Assignment Management System REST API'
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 5000}`,
      description: 'Local backend'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      RegisterRequest: {
        type: 'object',
        required: ['first_name', 'last_name', 'email', 'password'],
        properties: {
          first_name: { type: 'string', example: 'Demo' },
          last_name: { type: 'string', example: 'Student' },
          email: { type: 'string', example: 'demo.student@gams.edu' },
          password: { type: 'string', example: 'Password123!' },
          role: { type: 'string', enum: ['Student', 'Instructor', 'Admin'], example: 'Student' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'demo.student@gams.edu' },
          password: { type: 'string', example: 'Password123!' }
        }
      },
      GroupworkRequest: {
        type: 'object',
        required: ['groupwork_name', 'subject'],
        properties: {
          groupwork_name: { type: 'string', example: 'Data Science Project' },
          subject: { type: 'string', example: 'AI and Data Mining' },
          description: { type: 'string', example: 'Final assignment group.' },
          groupwork_code: { type: 'string', example: 'DSP-2026' }
        }
      },
      AssignmentRequest: {
        type: 'object',
        required: ['groupwork_id', 'assignment_name', 'deadline'],
        properties: {
          groupwork_id: { type: 'integer', example: 1 },
          assignment_name: { type: 'string', example: 'AI Ethics Presentation' },
          assignment_description: { type: 'string', example: 'Prepare slides and talking points.' },
          deadline: { type: 'string', format: 'date', example: '2026-07-20' },
          status: { type: 'string', enum: ['Not Started', 'In Progress', 'Completed'], example: 'Not Started' },
          priority: { type: 'string', enum: ['Low', 'Medium', 'High'], example: 'High' }
        }
      },
      TaskRequest: {
        type: 'object',
        required: ['assignment_id', 'task_name', 'due_date'],
        properties: {
          assignment_id: { type: 'integer', example: 1 },
          assigned_user_id: { type: 'integer', example: 2 },
          task_name: { type: 'string', example: 'Collect survey data' },
          task_description: { type: 'string', example: 'Gather and clean survey responses.' },
          priority: { type: 'string', enum: ['Low', 'Medium', 'High'], example: 'Medium' },
          status: { type: 'string', enum: ['Pending', 'In Progress', 'Completed'], example: 'Pending' },
          due_date: { type: 'string', format: 'date', example: '2026-07-18' }
        }
      },
      StatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['Pending', 'In Progress', 'Completed'], example: 'Completed' }
        }
      }
    }
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } }
        },
        responses: { 201: { description: 'User registered' }, 409: { description: 'Duplicate email' } }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive a JWT',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } }
        },
        responses: { 200: { description: 'Login successful' }, 401: { description: 'Invalid credentials' } }
      }
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get logged-in user',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Authenticated user' }, 401: { description: 'Unauthorized' } }
      }
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List users',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Users fetched' } }
      }
    },
    '/api/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by id',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'User fetched' }, 404: { description: 'User not found' } }
      },
      put: {
        tags: ['Users'],
        summary: 'Update user',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } },
        responses: { 200: { description: 'User updated' } }
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user as Admin',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'User deleted' }, 403: { description: 'Forbidden' } }
      }
    },
    '/api/groupworks': {
      post: {
        tags: ['Groupworks'],
        summary: 'Create groupwork',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/GroupworkRequest' } } } },
        responses: { 201: { description: 'Groupwork created' } }
      },
      get: {
        tags: ['Groupworks'],
        summary: 'List groupworks visible to current user',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Groupworks fetched' } }
      }
    },
    '/api/groupworks/{id}': {
      get: {
        tags: ['Groupworks'],
        summary: 'Get groupwork by id',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Groupwork fetched' } }
      },
      put: {
        tags: ['Groupworks'],
        summary: 'Update groupwork as leader or Admin',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/GroupworkRequest' } } } },
        responses: { 200: { description: 'Groupwork updated' } }
      },
      delete: {
        tags: ['Groupworks'],
        summary: 'Delete groupwork as leader or Admin',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Groupwork deleted' } }
      }
    },
    '/api/groupworks/{id}/join': {
      post: {
        tags: ['Groupworks'],
        summary: 'Join groupwork',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { groupwork_code: { type: 'string', example: 'DSP-2026' } } } } } },
        responses: { 200: { description: 'Joined groupwork' } }
      }
    },
    '/api/groupworks/{id}/members': {
      get: {
        tags: ['Groupworks'],
        summary: 'List groupwork members',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Members fetched' } }
      }
    },
    '/api/groupworks/{groupworkId}/assignments': {
      get: {
        tags: ['Assignments'],
        summary: 'List assignments for a groupwork',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'groupworkId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Assignments fetched' } }
      }
    },
    '/api/assignments': {
      post: {
        tags: ['Assignments'],
        summary: 'Create assignment as leader or Admin',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/AssignmentRequest' } } } },
        responses: { 201: { description: 'Assignment created' } }
      },
      get: {
        tags: ['Assignments'],
        summary: 'List visible assignments',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Assignments fetched' } }
      }
    },
    '/api/assignments/{id}': {
      get: {
        tags: ['Assignments'],
        summary: 'Get assignment by id',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Assignment fetched' } }
      },
      put: {
        tags: ['Assignments'],
        summary: 'Update assignment as leader or Admin',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/AssignmentRequest' } } } },
        responses: { 200: { description: 'Assignment updated' } }
      },
      delete: {
        tags: ['Assignments'],
        summary: 'Delete assignment as leader or Admin',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Assignment deleted' } }
      }
    },
    '/api/assignments/{assignmentId}/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'List tasks for an assignment',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'assignmentId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Tasks fetched' } }
      }
    },
    '/api/assignments/{assignmentId}/progress': {
      get: {
        tags: ['Progress'],
        summary: 'Calculate assignment progress',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'assignmentId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Progress calculated' } }
      }
    },
    '/api/tasks': {
      post: {
        tags: ['Tasks'],
        summary: 'Create task as leader or Admin',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TaskRequest' } } } },
        responses: { 201: { description: 'Task created' } }
      },
      get: {
        tags: ['Tasks'],
        summary: 'List visible tasks',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Tasks fetched' } }
      }
    },
    '/api/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Get task by id',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Task fetched' } }
      },
      put: {
        tags: ['Tasks'],
        summary: 'Update task as leader or Admin',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/TaskRequest' } } } },
        responses: { 200: { description: 'Task updated' } }
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete task as leader or Admin',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Task deleted' } }
      }
    },
    '/api/tasks/{id}/status': {
      patch: {
        tags: ['Tasks'],
        summary: 'Update task status as assigned user, leader, or Admin',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/StatusRequest' } } } },
        responses: { 200: { description: 'Task status updated' } }
      }
    }
  }
};

const swaggerSpec = swaggerJSDoc({
  definition: swaggerDefinition,
  apis: []
});

export default swaggerSpec;
