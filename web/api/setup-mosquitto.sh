#!/bin/bash

# ============================================
# MQTT Broker Setup Script
# ============================================
# Install and configure Mosquitto MQTT broker
# on Ubuntu/Debian system

# Update package list
sudo apt-get update

# Install Mosquitto and client tools
sudo apt-get install -y mosquitto mosquitto-clients

# Enable and start Mosquitto service
sudo systemctl enable mosquitto
sudo systemctl start mosquitto

# Configure Mosquitto
cat <<EOF | sudo tee /etc/mosquitto/mosquitto.conf
# Mosquitto configuration for water meter system

# Listening port
port 1883

# Bind to all interfaces
bindaddress 0.0.0.0

# Enable persistence
persistence true
persistence_location /var/lib/mosquitto/

# Log level
log_dest file /var/log/mosquitto/mosquitto.log
log_type all

# Topic ACL
topic readwrite #

# Default permissions
default_qos 0
default_retain true
EOF

# Restart Mosquitto to apply changes
sudo systemctl restart mosquitto

# Check status
sudo systemctl status mosquitto

echo "MQTT Broker setup complete!"
echo "Broker running on port 1883"
echo "Test with: mosquitto_sub -h localhost -t 'meteran/#'"
echo "Publish test: mosquitto_pub -h localhost -t 'meteran/reading' -m '{\"test\":true}'"