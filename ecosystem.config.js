module.exports = {
  apps: [
    {
      name: 'menbazar-server',
      cwd: './server',
      script: 'dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      }
    },
    {
      name: 'menbazar-client',
      cwd: './client',
      script: 'npm',
      args: 'run start',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'menbazar-admin',
      cwd: './admin',
      script: 'npm',
      args: 'run start',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
