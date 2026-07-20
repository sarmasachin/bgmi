/**
 * PM2 process file for sensitivitysettings.com
 * Port must match nginx proxy_pass (127.0.0.1:3001).
 */
module.exports = {
  apps: [
    {
      name: "bgmi",
      cwd: "/var/www/bgmi",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3001",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: "3001",
      },
      error_file: "/var/log/bgmi-error.log",
      out_file: "/var/log/bgmi-out.log",
      time: true,
    },
  ],
};
