terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }

  cloud {
    organization = "mateusznasewicz"
    workspaces {
      name = "dopamine-delivery-cli-workspace"
    }
  }
}

data "digitalocean_ssh_key" "github_actions_key" {
  name = "github-actions-deploy"
}

resource "digitalocean_droplet" "web_app" {
    image     = "ubuntu-24-04-x64"
    name      = "dopamine-delivery-prod"
    region    = "fra1"
    size      = "s-2vcpu-2gb"
    ssh_keys  = [data.digitalocean_ssh_key.github_actions_key.id]

    user_data = <<-EOF
                #!/bin/bash
                set -e

                apt-get update
                apt-get install -y curl gnupg lsb-release
                
                mkdir -p /etc/apt/keyrings
                curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
                
                echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
                
                apt-get update
                apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

                EOF
}

output "droplet_ip" {
  value       = digitalocean_droplet.web_app.ipv4_address
  description = "IP Twojego nowego serwera"
}