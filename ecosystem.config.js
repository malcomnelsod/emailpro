module.exports = {
  apps: [{
    name: 'mailbutler-clone',
    script: 'npm',
    args: 'run preview',
    cwd: '/home/ubuntu/mailbutler-clone',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4173
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};