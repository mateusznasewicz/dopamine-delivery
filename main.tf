terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {
  token = var.do_token
}

variable "do_token" {
  type        = string
  description = "Twój DigitalOcean API Token"
}

variable "ssh_public_key_path" {
  type        = string
  default     = "~/.ssh/id_ed25519.pub"
  description = "Ścieżka do klucza SSH"
}

resource "digitalocean_ssh_key" "my_key" {
  name       = "dopamine-delivery-key"
  public_key = file(var.ssh_public_key_path)
}

resource "digitalocean_droplet" "web_app" {
    image     = "ubuntu-24-04-x64"
    name      = "dopamine-delivery-prod"
    region    = "fra1"
    size      = "s-2vcpu-2gb"
    ssh_keys  = [digitalocean_ssh_key.my_key.id]

    connection {
        type        = "ssh"
        user        = "root"
        private_key = file("~/.ssh/id_ed25519")
        host        = self.ipv4_address
    }

    provisioner "file" {
        source      = "./config"
        destination = "/app"
    }

    user_data = <<-EOF
                #!/bin/bash
                set -e

                until [ -f /app/docker-compose.yml ]; do
                  echo "Oczekiwanie na przesłanie plików konfiguracyjnych przez Terraform..."
                  sleep 2
                done

                apt-get update
                apt-get install -y curl gnupg lsb-release
                
                mkdir -p /etc/apt/keyrings
                curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
                
                echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
                
                apt-get update
                apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

                chmod +x /app/db-init.sh || true

                cd /app
                docker compose up -d
                EOF
}

output "droplet_ip" {
  value       = digitalocean_droplet.web_app.ipv4_address
  description = "IP Twojego nowego serwera"
}