import json
import os
import time
import boto3
from botocore.client import Config
import requests
import datetime


class Builder:
    def __init__(self):
        self.job = os.getenv('CI_JOB_NAME')
        self.payload = {
            "client_id": "cli"
        }
        self.headers = {
            'Authorization': f'Token {os.getenv("VERSION_TOKEN")}',
            'Content-Type': 'application/json'
        }
        self.version = self.get_version()

        if self.job == 'build_mac_arm64':
            self.os = 'macOS'
            self.architecture = 'arm64'
            self.local_file = f'locker_mac_arm64-dev'
            self.public_file = f'locker-cli-mac-arm64-{self.version}'
            self.commands = [f'GOOS=darwin GOARCH=arm64 CGO_ENABLED=0 go build -ldflags="-s -w -X object.VERSION={self.version}" -o locker_mac_arm64-dev']
        elif self.job == 'build_mac_x64':
            self.os = 'macOS'
            self.architecture = 'x64'
            self.local_file = f'locker_mac_x64-dev'
            self.public_file = f'locker-cli-mac-x64-{self.version}'
            self.commands = [f'GOOS=darwin GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-s -w -X object.VERSION={self.version}" -o locker_mac_x64-dev']
        elif self.job == 'build_windows_x64':
            self.os = 'Windows'
            self.architecture = 'x64'
            self.local_file = f'locker_windows-dev.exe'
            self.public_file = f'locker-cli-win-x64-{self.version}.exe'
            self.commands = [f'go build -ldflags="-s -w -X object.VERSION={self.version}" -o locker_windows-dev.exe',
                             f'signtool sign /fd sha256 /a {self.local_file}']
        else:
            self.os = 'Linux'
            self.architecture = 'x64'
            self.local_file = f'locker_linux-dev'
            self.public_file = f'locker-cli-linux-x64-{self.version}'
            self.commands = [f'CGO_ENABLED=0 go build -ldflags="-s -w -X object.VERSION={self.version}" -o locker_linux-dev']

    def get_version(self):
        if self.job == 'build_mac_arm64':
            self.payload['platform'] = 'mac-arm64'
        elif self.job == 'build_mac_x64':
            self.payload['platform'] = 'mac-x64'
        elif self.job == 'build_windows_x64':
            self.payload['platform'] = 'windows'
        else:
            self.payload['platform'] = 'linux'
        resp = requests.post(os.getenv("GET_VERSION_URL"), headers=self.headers, json=self.payload).text
        return json.loads(resp)['version']

    def update_version(self, success):
        if not success:
            return None
        self.payload['build'] = success
        resp = requests.post(os.getenv('UPDATE_VERSION_URL'), headers=self.headers, json=self.payload).text
        version = json.loads(resp)['version']
        os.system(f'git tag -a v{version} -m "Tag new version"')
        os.system(f'git remote set-url origin {os.getenv("ORIGIN")}')
        os.system(f'git push origin v{version} -o ci.skip')
        return version

    def upload(self):
        if os.path.isfile(self.local_file):
            config = Config(connect_timeout=3600, read_timeout=3600)
            client = boto3.client('s3', config=config)
            client.upload_file(self.local_file, 'lockerio', f'download/{self.public_file}',
                               ExtraArgs={'ACL': 'public-read'})
            return self.update_version(True)
        else:
            return self.update_version(False)

    def build(self):
        # if self.os != 'Linux':
        for command in self.commands:
            os.system(command)

    def notify(self):
        msg = "New Locker CLI version is available"
        slack_webhook = os.getenv('SLACK_WEBHOOK')
        s3_url = f'https://s.locker.io/download/{self.public_file}'
        payload = {
            "attachments": [
                {
                    "fallback": msg,
                    "color": "#28a745",
                    "title": msg,
                    "title_link": s3_url,
                    "fields": [
                        {
                            "title": "OS",
                            "value": self.os,
                            "short": True
                        },
                        {
                            "title": "Architecture",
                            "value": self.architecture,
                            "short": True
                        },
                        {
                            "title": "Download",
                            "value": s3_url,
                            "short": True
                        },
                        {
                            "title": "Version",
                            "value": self.version,
                            "short": True
                        }

                    ],
                    "ts": int(time.time())
                }
            ]
        }
        requests.post(url=slack_webhook, json=payload)


if __name__ == '__main__':
    builder = Builder()
    builder.build()
    if builder.upload() is not None:
        builder.notify()
