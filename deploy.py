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
        self.org = os.getenv('ORG')
        environment = os.getenv('ENV')
        self.staging = False if environment == 'release' else True
        self.payload = {
            "client_id": "desktop",
            "environment": 'staging' if self.staging else 'prod'
        }
        self.headers = {
            'Authorization': f'Token {os.getenv("VERSION_TOKEN")}',
            'Content-Type': 'application/json'
        }
        self.version = self.get_version()

        self.update_env()


        if self.job == 'build_mac_arm64':
            self.os = 'macOS'
            self.architecture = 'arm64'
            self.local_file = f'locker-mac-arm64-{self.version}.dmg'
            self.public_file = f'locker-mac-arm64-{self.version}-{environment}.dmg'
            if not self.staging:
                self.commands = ['yarn install', 'yarn build-release-mac-dmg', 'yarn build-release-mac-mas']
            else:
                self.commands = ['yarn install', 'yarn build-staging-mac-dmg']
        elif self.job == 'build_mac_x64':
            self.os = 'macOS'
            self.architecture = 'x64'
            self.local_file = f'Locker Password Manager-{self.version}.pkg'
            self.public_file = f'locker-mac-x64-{self.version}-{self.org}.pkg'
            if not self.staging:
                self.commands = [f'cp /Users/locker/locker-service-{self.org} ./locker-service', 'yarn install', 'yarn release:mac']
            else:
                self.commands = [f'cp /Users/locker/locker-service-{self.org} ./locker-service', 'yarn install', 'yarn release:mac']
        elif self.job == 'build_windows_x64':
            self.os = 'Windows'
            self.architecture = 'x64'
            self.local_file = f'Locker Password Manager Setup {self.version}.exe'
            self.public_file = f'locker-win-x64-{self.version}-{self.org}.exe'
            if not self.staging:
                self.commands = [f'cp C:\\dangvh\\locker-service-{self.org}.exe service\\locker_service.exe', 'yarn install', 'yarn release:win-64']
            else:
                self.commands = [f'cp C:\\dangvh\\locker-service-{self.org}.exe service\\locker_service.exe', 'yarn install', 'yarn release:win-64']
        else:
            self.os = 'Linux'
            self.architecture = 'x64'
            self.local_file = f'Locker Password Manager Setup {self.version}.deb'
            self.public_file = f'locker-linux-x64-{self.version}-{self.org}.deb'
            if not self.staging:
                self.commands = ['yarn install', 'yarn build-release-linux-snap',
                                 f'snapcraft upload --release=beta build/locker-{self.version}.snap',
                                 'yarn build-release-linux-appimage', 'yarn build-release-linux-deb']
            else:
                self.commands = [f'cp /home/gitlab-runner/locker-service-{self.org} service/locker_service', 'yarn install', 'yarn release']

    def get_version(self):
        if self.job == 'build_mac_arm64':
            self.payload['platform'] = 'mac-arm64'
        elif self.job == 'build_mac_x64':
            self.payload['platform'] = 'mac-x64'
        elif self.job == 'build_windows_x64':
            self.payload['platform'] = 'windows'
        else:
            self.payload['platform'] = 'linux'
        resp = requests.post(os.getenv('GET_VERSION_URL'), headers=self.headers, json=self.payload).text
        return json.loads(resp)['version']

    def update_version(self, success):
        if not success:
            return None
        if self.get_version() == self.version: # version not updated
            self.payload['build'] = success
            resp = requests.post(os.getenv('UPDATE_VERSION_URL'), headers=self.headers, json=self.payload).text
            return json.loads(resp)['version']
        else:   # version updated
            return self.get_version()

    def update_env(self):
        constants = json.load(open('public/constants.json'))
        constants['REACT_APP_API_URL'] = os.getenv('REACT_APP_API_URL')
        constants['REACT_APP_CF_ACCESS_CLIENT_ID'] = os.getenv('REACT_APP_CF_ACCESS_CLIENT_ID')
        constants['REACT_APP_CF_ACCESS_CLIENT_SECRET'] = os.getenv('REACT_APP_CF_ACCESS_CLIENT_SECRET')
        f = open('public/constants.json', 'w')
        f.write(json.dumps(constants))
        f.close()

    def upload(self):
        # try:
        if os.path.isfile(f'dist/{self.local_file}'):
            if self.staging:
                config = Config(connect_timeout=3600, read_timeout=3600)
                client = boto3.client('s3', config=config)
                client.upload_file(f'dist/{self.local_file}', 'lockerio', f'download/{self.public_file}',
                                   ExtraArgs={'ACL': 'public-read'})
            return self.update_version(True)
        else:
            return self.update_version(False)

    def build(self):
        # if self.os != 'Linux':
        package_json = json.load(open('package.json'))
        package_json['version'] = self.version
        f = open('package.json', 'w')
        f.write(json.dumps(package_json))
        f.close()
        for command in self.commands:
            os.system(command)

    def notify(self):
        msg = "New Locker version is available"
        slack_webhook = os.getenv('SLACK_WEBHOOK')
        github_url = f'https://github.com/lockerpm/desktop-releases/releases/download/v{self.version}/{self.local_file}'
        s3_url = f'https://s.locker.io/download/{self.public_file}'
        payload = {
            "attachments": [
                {
                    "fallback": msg,
                    "color": "#28a745",
                    "title": msg,
                    "title_link": s3_url if self.staging else github_url,
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
                            "value": s3_url if self.staging else github_url,
                            "short": True
                        },
                        {
                            "title": "Version",
                            "value": self.version,
                            "short": True
                        },
                        {
                            "title": "Organization",
                            "value": self.org,
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