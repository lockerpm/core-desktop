module.exports = {
  apps: [{
    name: 'portal-admin',
    script: './node_modules/@craco/craco/bin/craco.js',
    args: 'start',
    min_uptime: 10000,
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    max_restarts: 10,
    watch: false,
    cwd: './',
    time: true
  }]
}
