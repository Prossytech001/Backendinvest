// admin.js (AdminJS setup for user management)
require('dotenv').config();
const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSMongoose = require('@adminjs/mongoose');
const mongoose = require('mongoose');
const express = require('express');
const User = require('./model/User'); // ✅ your User model

AdminJS.registerAdapter(AdminJSMongoose);

const adminJs = new AdminJS({
  resources: [
    {
      resource: User,
      options: {
        listProperties: ['username', 'email', 'balance', 'withdrawableBalance', 'totalEarnings', 'isVerified', 'role'],
        filterProperties: ['username', 'email', 'isVerified', 'role'],
        editProperties: ['username', 'email', 'isVerified', 'role'],
        showProperties: [
          'username', 'email', 'balance', 'withdrawableBalance', 'totalEarnings',
          'isAdmin', 'isVerified', 'role', 'createdAt', 'updatedAt'
        ],
        actions: {
          deactivate: {
            actionType: 'record',
            icon: 'Pause',
            handler: async (req, res, context) => {
              const user = context.record;
              await user.update({ isVerified: false });
              return {
                record: user.toJSON(),
                notice: {
                  message: 'User marked as unverified (deactivated)',
                  type: 'info'
                }
              };
            },
            showInDrawer: false,
            isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin'
          },
          activate: {
            actionType: 'record',
            icon: 'Play',
            handler: async (req, res, context) => {
              const user = context.record;
              await user.update({ isVerified: true });
              return {
                record: user.toJSON(),
                notice: {
                  message: 'User verified (activated)',
                  type: 'success'
                }
              };
            },
            showInDrawer: false,
            isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin'
          },
          delete: {
            actionType: 'record',
            icon: 'Trash',
            guard: 'Are you sure you want to delete this user?',
            handler: async (req, res, context) => {
              const user = context.record;
              await user.delete();
              return {
                record: user.toJSON(),
                notice: {
                  message: 'User deleted successfully',
                  type: 'success'
                }
              };
            },
            isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin'
          }
        }
      }
    }
  ],
  rootPath: '/admin',
  branding: {
    companyName: 'My Admin Panel',
  }
});

const router = AdminJSExpress.buildRouter(adminJs);

const app = express();
app.use(adminJs.options.rootPath, router);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(3000, () => {
      console.log('✅ Admin panel running on http://localhost:3000/admin');
    });
  });