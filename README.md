<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
## About

ICAR Reference App

Icar provider service is reference app for adding contents related to vistaar network. Provider can register themselves and add their contents to this app. Provider can create/read/update/delete their contents.

Steps to install this app.
    1. Git clone https://github.com/tekdi/icar-provider-service.git
    2. cd icar-provider-service
    3. npm install
    4. npm run start
    5. run http://localhost:3000 on your browser to test the app is running
    6. Add .env file in this format

        HASURA_URL= https://onest-bap.tekdinext.com/hasura/v1/graphql
        HASURA_GRAPHQL_ADMIN_SECRET= "******"
        HASURA_NAMESPACE= icar_
        PORT=3000
        S3_REGION=ap-south-1
        S3_BUCKET=onest-bucket
        SECRET_ACCESS_KEY=******
        ACCESS_KEY_ID=******
        EXPIRES_IN=3600

    7. Restart the server: npm run start

Import the postman collection to test the api:

link: https://docs.google.com/document/d/1AxE89Aksh69jSwhV-DVt1i6sFzVWlPu2CLh2ddai6MU/edit?usp=sharing

api-postman jason file:

{
	"info": {
		"_postman_id": "1a41994e-a329-4c15-b965-1ee478a6e71f",
		"name": "icar-provider-service",
		"schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
		"_exporter_id": "18319029",
		"_collection_link": "https://web.postman.co/workspace/13fbe18d-7c0e-4245-bf2f-0fa5d5758b3a/collection/18319029-1a41994e-a329-4c15-b965-1ee478a6e71f?action=share&source=collection_link&creator=18319029"
	},
	"item": [
		{
			"name": "admin",
			"item": [
				{
					"name": "adminRegister",
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNodWJoYW0xQGdtYWlsLmNvbSIsInBhc3N3b3JkIjoiMTIzNDUiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2OTU4MDU2MzksImV4cCI6MTcwNDQ0NTYzOX0.F1p_-TblABf6LPPIbKTMw_DHfOi0xmOuu3GbM9Jhkw4",
									"type": "string"
								}
							]
						},
						"method": "POST",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"name\":\"Suraj Kumar\",\n    \"email\":\"suraj123@gmail.com\",\n    \"password\":\"123456\",\n    \"role\":\"admin\"\n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/admin/registerAdmin",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"admin",
								"registerAdmin"
							]
						}
					},
					"response": []
				},
				{
					"name": "appoveApi",
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwibW9iaWxlIjpudWxsLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6InN1cmFqNkBnbWFpbC5jb20iLCJwYXNzd29yZCI6IiQyYiQxMCRWYS56V3FRNTY0SUFYZ1B2TEt4Vi51dzRkN3RsQmR5Q0d1QWFHLnYzLjZkTmZuNUtVMGp6MiIsImlhdCI6MTY5NTgxMTAyMywiZXhwIjoxNzA0NDUxMDIzfQ.vTiw_jxtoMubqTWng-4AsvvPz_41ksFtGa1qFVe0cOw",
									"type": "string"
								}
							]
						},
						"method": "PATCH",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"approved\":true\n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/admin/approval/45",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"admin",
								"approval",
								"45"
							]
						}
					},
					"response": []
				},
				{
					"name": "get provider List",
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwibW9iaWxlIjpudWxsLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6InN1cmFqNkBnbWFpbC5jb20iLCJwYXNzd29yZCI6IiQyYiQxMCRWYS56V3FRNTY0SUFYZ1B2TEt4Vi51dzRkN3RsQmR5Q0d1QWFHLnYzLjZkTmZuNUtVMGp6MiIsImlhdCI6MTY5NTgxMTAyMywiZXhwIjoxNzA0NDUxMDIzfQ.vTiw_jxtoMubqTWng-4AsvvPz_41ksFtGa1qFVe0cOw",
									"type": "string"
								}
							]
						},
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}/admin/getProviderList",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"admin",
								"getProviderList"
							]
						}
					},
					"response": []
				},
				{
					"name": "enable or disable Api",
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwibW9iaWxlIjpudWxsLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6InN1cmFqNkBnbWFpbC5jb20iLCJwYXNzd29yZCI6IiQyYiQxMCRWYS56V3FRNTY0SUFYZ1B2TEt4Vi51dzRkN3RsQmR5Q0d1QWFHLnYzLjZkTmZuNUtVMGp6MiIsImlhdCI6MTY5NTgxMTAyMywiZXhwIjoxNzA0NDUxMDIzfQ.vTiw_jxtoMubqTWng-4AsvvPz_41ksFtGa1qFVe0cOw",
									"type": "string"
								}
							]
						},
						"method": "PATCH",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"enable\":true\n    \n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/admin/enable/9",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"admin",
								"enable",
								"9"
							]
						}
					},
					"response": []
				},
				{
					"name": "get seeker List",
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwibW9iaWxlIjpudWxsLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6InN1cmFqNkBnbWFpbC5jb20iLCJwYXNzd29yZCI6IiQyYiQxMCRWYS56V3FRNTY0SUFYZ1B2TEt4Vi51dzRkN3RsQmR5Q0d1QWFHLnYzLjZkTmZuNUtVMGp6MiIsImlhdCI6MTY5NTgxMTAyMywiZXhwIjoxNzA0NDUxMDIzfQ.vTiw_jxtoMubqTWng-4AsvvPz_41ksFtGa1qFVe0cOw",
									"type": "string"
								}
							]
						},
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}/admin/getSeekerList",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"admin",
								"getSeekerList"
							]
						}
					},
					"response": []
				},
				{
					"name": "get provider info",
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwibW9iaWxlIjpudWxsLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6InN1cmFqNkBnbWFpbC5jb20iLCJwYXNzd29yZCI6IiQyYiQxMCRWYS56V3FRNTY0SUFYZ1B2TEt4Vi51dzRkN3RsQmR5Q0d1QWFHLnYzLjZkTmZuNUtVMGp6MiIsImlhdCI6MTY5NTgxMTAyMywiZXhwIjoxNzA0NDUxMDIzfQ.vTiw_jxtoMubqTWng-4AsvvPz_41ksFtGa1qFVe0cOw",
									"type": "string"
								}
							]
						},
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}/admin/getProviderInfo/35",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"admin",
								"getProviderInfo",
								"35"
							]
						}
					},
					"response": []
				},
				{
					"name": "get seeker info",
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwibW9iaWxlIjpudWxsLCJyb2xlIjoiYWRtaW4iLCJlbWFpbCI6InN1cmFqNkBnbWFpbC5jb20iLCJwYXNzd29yZCI6IiQyYiQxMCRWYS56V3FRNTY0SUFYZ1B2TEt4Vi51dzRkN3RsQmR5Q0d1QWFHLnYzLjZkTmZuNUtVMGp6MiIsImlhdCI6MTY5NTgxMTAyMywiZXhwIjoxNzA0NDUxMDIzfQ.vTiw_jxtoMubqTWng-4AsvvPz_41ksFtGa1qFVe0cOw",
									"type": "string"
								}
							]
						},
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{base_url}}/admin/getSeekerInfo/16",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"admin",
								"getSeekerInfo",
								"16"
							]
						}
					},
					"response": []
				}
			]
		},
		{
			"name": "provider",
			"item": [
				{
					"name": "createContent",
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQwLCJuYW1lIjoiU3VyYWogcHJvdmlkZXIiLCJlbWFpbCI6InN1cmFqXzEyM0BnbWFpbC5jb20iLCJtb2JpbGUiOm51bGwsInBhc3N3b3JkIjoiJDJiJDEwJDNqbHFWNHJOV0REbXc5Y2EuaEFzWU9wWFdCOHlGTmhONlI5L2o1Z0htTDRBVUNBYXRveDZhIiwicm9sZSI6InByb3ZpZGVyIiwiYXBwcm92ZWQiOnRydWUsImVuYWJsZSI6dHJ1ZSwiaWF0IjoxNzE2NTQ2ODM3LCJleHAiOjE3MjUxODY4Mzd9.p2clHYq0c3yXKMRzNk6EWlSTvdifVIchwTTjP1Cv0X0",
									"type": "string"
								}
							]
						},
						"method": "POST",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"code\": \"124\",\n    \"competency\": \"C-6.1: Shows care for and joy in engaging with all life forms\",\n    \"contentType\": \"Video\",\n    \"description\": \"This is Test data for a particular course\",\n    \"domain\": \"Socio-Emotional and Ethical Development\",\n    \"goal\": \"CG-6: Children develop a positive regard for the natural environment around them\",\n    \"language\": \"English\",\n    \"link\": \"https://www.youtube.com/watch?v=cPkLvk_DgUA\",\n    \"sourceOrganisation\": \"Tekdi\",\n    \"themes\": \"Video\",\n    \"title\": \"license\",\n    \"content_id\": \"123999\",\n    \"publisher\": \"Tekdi\",\n    \"collection\": false,\n    \"urlType\": \"BPP-REMOTE-PLAYER\",\n    \"mimeType\": \"pdf\",\n    \"minAge\": \"10\",\n    \"maxAge\": \"18\",\n    \"author\": \"Suraj\",\n    \"learningOutcomes\": \"abc\",\n    \"category\": [\"1\"],\n    \"persona\": \"Parent\",\n    \"license\": \"xyz\",\n    \"conditions\": \"abc\",\n    \"fulfillments\": [\"1\"]\n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/provider/content",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"provider",
								"content"
							]
						}
					},
					"response": []
				},
				{
					"name": "Get Content",
					"protocolProfileBehavior": {
						"disableBodyPruning": true
					},
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQwLCJuYW1lIjoiU3VyYWogcHJvdmlkZXIiLCJlbWFpbCI6InN1cmFqXzEyM0BnbWFpbC5jb20iLCJtb2JpbGUiOm51bGwsInBhc3N3b3JkIjoiJDJiJDEwJDNqbHFWNHJOV0REbXc5Y2EuaEFzWU9wWFdCOHlGTmhONlI5L2o1Z0htTDRBVUNBYXRveDZhIiwicm9sZSI6InByb3ZpZGVyIiwiYXBwcm92ZWQiOnRydWUsImVuYWJsZSI6dHJ1ZSwiaWF0IjoxNzE0NjI5NjI5LCJleHAiOjE3MjMyNjk2Mjl9.oIt2_qI2K9mkFTnqPx0t6qGviAHBshBwHgncuRlltD4",
									"type": "string"
								}
							]
						},
						"method": "GET",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/provider/content",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"provider",
								"content"
							]
						}
					},
					"response": []
				},
				{
					"name": "edit Content",
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTcsIm5hbWUiOiJTdXJhaiBLdW1hciIsImVtYWlsIjoic3VyYWpfMTIzQGdtYWlsLmNvbSIsIm1vYmlsZSI6bnVsbCwicGFzc3dvcmQiOiIkMmIkMTAkZlNOc1NySDNKTTZjMkd1eTdlTEN5ZTk4S1FSY2lacS80Lmc1WHVDZThMNEduV0ZIWDV4bEsiLCJyb2xlIjoicHJvdmlkZXIiLCJhcHByb3ZlZCI6dHJ1ZSwiZW5hYmxlIjp0cnVlLCJpYXQiOjE3MjM1MjcyMDYsImV4cCI6MTczMjE2NzIwNn0.9fc80Bok5ysjyyeRE3xY4YiZcRJA27YRJd9XsCKWC34",
									"type": "string"
								}
							]
						},
						"method": "PATCH",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"contentType\": \"Read\",\n    \n    \"crop\": \"Chilly1\",\n    \"description\": \"This is test course\",\n    \"expiryDate\": \"2024-08-13\",\n    \"fileType\": \"Video\",\n   \n    \"monthOrSeason\": \"April\",\n    \"publishDate\": \"2024-08-12\",\n    \"publisher\": \"Test\",\n    \"region\": \"Konkan\",\n    \"state\": \"Maharashtra\",\n    \"target_users\": \"Farmers\",\n    \"title\": \"Test\",\n    \"url\": \"https://youtu.be/wm5gMKuwSYk?si=LxvdijS8HL9kiD7B\",\n    \n    \"branch\": \"Horticulture\"\n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/provider/content/70",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"provider",
								"content",
								"70"
							]
						}
					},
					"response": []
				},
				{
					"name": "reset password",
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTcsIm5hbWUiOiJTdXJhaiBLdW1hciIsImVtYWlsIjoic3VyYWpfMTIzQGdtYWlsLmNvbSIsIm1vYmlsZSI6bnVsbCwicGFzc3dvcmQiOiIkMmIkMTAkZlNOc1NySDNKTTZjMkd1eTdlTEN5ZTk4S1FSY2lacS80Lmc1WHVDZThMNEduV0ZIWDV4bEsiLCJyb2xlIjoicHJvdmlkZXIiLCJhcHByb3ZlZCI6dHJ1ZSwiZW5hYmxlIjp0cnVlLCJpYXQiOjE3MjQyMTM0NzksImV4cCI6MTczMjg1MzQ3OX0.K6ImLeLANAYQeG0pD_0MpGL758uQlSzjIlf5RuzCFXo",
									"type": "string"
								}
							]
						},
						"method": "PATCH",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"currentPassword\": \"654321\",\n    \"newPassword\": \"123456\"\n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/provider/resetPassword",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"provider",
								"resetPassword"
							]
						}
					},
					"response": []
				},
				{
					"name": "create collection",
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzUsIm5hbWUiOiJTdXJhaiBLdW1hciIsImVtYWlsIjoic3VyYWoxMjNAZ21haWwuY29tIiwibW9iaWxlIjpudWxsLCJwYXNzd29yZCI6IiQyYiQxMCR5Nk9QTDVLU3MvVDQuRTVpVUE3c2h1enVzbDAzV3U3NEZuUjNSNzh5YjgzbGFzdi8yWGZRLiIsInJvbGUiOiJwcm92aWRlciIsImFwcHJvdmVkIjp0cnVlLCJlbmFibGUiOnRydWUsImlhdCI6MTY5NTk3NzA1NiwiZXhwIjoxNzA0NjE3MDU2fQ.F6RAw0AkuBVOcPvYz4ScT3PeoSaUlhZk6IwAkhxK4rE",
									"type": "string"
								}
							]
						},
						"method": "POST",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"title\": \"Lion stories\"\n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/provider/collection",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"provider",
								"collection"
							]
						}
					},
					"response": []
				},
				{
					"name": "get collection",
					"protocolProfileBehavior": {
						"disableBodyPruning": true
					},
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzUsIm5hbWUiOiJTdXJhaiBLdW1hciIsImVtYWlsIjoic3VyYWoxMjNAZ21haWwuY29tIiwibW9iaWxlIjpudWxsLCJwYXNzd29yZCI6IiQyYiQxMCR5Nk9QTDVLU3MvVDQuRTVpVUE3c2h1enVzbDAzV3U3NEZuUjNSNzh5YjgzbGFzdi8yWGZRLiIsInJvbGUiOiJwcm92aWRlciIsImFwcHJvdmVkIjp0cnVlLCJlbmFibGUiOnRydWUsImlhdCI6MTY5NTk3NzA1NiwiZXhwIjoxNzA0NjE3MDU2fQ.F6RAw0AkuBVOcPvYz4ScT3PeoSaUlhZk6IwAkhxK4rE",
									"type": "string"
								}
							]
						},
						"method": "GET",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/provider/collection",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"provider",
								"collection"
							]
						}
					},
					"response": []
				},
				{
					"name": "update collection",
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzUsIm5hbWUiOiJTdXJhaiBLdW1hciIsImVtYWlsIjoic3VyYWoxMjNAZ21haWwuY29tIiwibW9iaWxlIjpudWxsLCJwYXNzd29yZCI6IiQyYiQxMCR5Nk9QTDVLU3MvVDQuRTVpVUE3c2h1enVzbDAzV3U3NEZuUjNSNzh5YjgzbGFzdi8yWGZRLiIsInJvbGUiOiJwcm92aWRlciIsImFwcHJvdmVkIjp0cnVlLCJlbmFibGUiOnRydWUsImlhdCI6MTY5NTk3NzA1NiwiZXhwIjoxNzA0NjE3MDU2fQ.F6RAw0AkuBVOcPvYz4ScT3PeoSaUlhZk6IwAkhxK4rE",
									"type": "string"
								}
							]
						},
						"method": "PATCH",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "{\n     \"title\": \"Panthor stories\"\n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/provider/collection/1",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"provider",
								"collection",
								"1"
							]
						}
					},
					"response": []
				},
				{
					"name": "delete collection",
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzUsIm5hbWUiOiJTdXJhaiBLdW1hciIsImVtYWlsIjoic3VyYWoxMjNAZ21haWwuY29tIiwibW9iaWxlIjpudWxsLCJwYXNzd29yZCI6IiQyYiQxMCR5Nk9QTDVLU3MvVDQuRTVpVUE3c2h1enVzbDAzV3U3NEZuUjNSNzh5YjgzbGFzdi8yWGZRLiIsInJvbGUiOiJwcm92aWRlciIsImFwcHJvdmVkIjp0cnVlLCJlbmFibGUiOnRydWUsImlhdCI6MTY5NTk3NzA1NiwiZXhwIjoxNzA0NjE3MDU2fQ.F6RAw0AkuBVOcPvYz4ScT3PeoSaUlhZk6IwAkhxK4rE",
									"type": "string"
								}
							]
						},
						"method": "DELETE",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "{\n     \"title\": \"Panthor stories\"\n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/provider/collection/1",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"provider",
								"collection",
								"1"
							]
						}
					},
					"response": []
				},
				{
					"name": "add content collection",
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzUsIm5hbWUiOiJTdXJhaiBLdW1hciIsImVtYWlsIjoic3VyYWoxMjNAZ21haWwuY29tIiwibW9iaWxlIjpudWxsLCJwYXNzd29yZCI6IiQyYiQxMCR5Nk9QTDVLU3MvVDQuRTVpVUE3c2h1enVzbDAzV3U3NEZuUjNSNzh5YjgzbGFzdi8yWGZRLiIsInJvbGUiOiJwcm92aWRlciIsImFwcHJvdmVkIjp0cnVlLCJlbmFibGUiOnRydWUsImlhdCI6MTY5NTk3NzA1NiwiZXhwIjoxNzA0NjE3MDU2fQ.F6RAw0AkuBVOcPvYz4ScT3PeoSaUlhZk6IwAkhxK4rE",
									"type": "string"
								}
							]
						},
						"method": "POST",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"collection_id\": 1,\n    \"content_id\": 12\n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/provider/contentCollection",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"provider",
								"contentCollection"
							]
						}
					},
					"response": []
				},
				{
					"name": "delete content collection",
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzUsIm5hbWUiOiJTdXJhaiBLdW1hciIsImVtYWlsIjoic3VyYWoxMjNAZ21haWwuY29tIiwibW9iaWxlIjpudWxsLCJwYXNzd29yZCI6IiQyYiQxMCR5Nk9QTDVLU3MvVDQuRTVpVUE3c2h1enVzbDAzV3U3NEZuUjNSNzh5YjgzbGFzdi8yWGZRLiIsInJvbGUiOiJwcm92aWRlciIsImFwcHJvdmVkIjp0cnVlLCJlbmFibGUiOnRydWUsImlhdCI6MTY5NTk3NzA1NiwiZXhwIjoxNzA0NjE3MDU2fQ.F6RAw0AkuBVOcPvYz4ScT3PeoSaUlhZk6IwAkhxK4rE",
									"type": "string"
								}
							]
						},
						"method": "DELETE",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/provider/contentCollection/8",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"provider",
								"contentCollection",
								"8"
							]
						}
					},
					"response": []
				},
				{
					"name": "get collection content by id",
					"protocolProfileBehavior": {
						"disableBodyPruning": true
					},
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzUsIm5hbWUiOiJTdXJhaiBLdW1hciIsImVtYWlsIjoic3VyYWoxMjNAZ21haWwuY29tIiwibW9iaWxlIjpudWxsLCJwYXNzd29yZCI6IiQyYiQxMCR5Nk9QTDVLU3MvVDQuRTVpVUE3c2h1enVzbDAzV3U3NEZuUjNSNzh5YjgzbGFzdi8yWGZRLiIsInJvbGUiOiJwcm92aWRlciIsImFwcHJvdmVkIjp0cnVlLCJlbmFibGUiOnRydWUsImlhdCI6MTY5NTk3NzA1NiwiZXhwIjoxNzA0NjE3MDU2fQ.F6RAw0AkuBVOcPvYz4ScT3PeoSaUlhZk6IwAkhxK4rE",
									"type": "string"
								}
							]
						},
						"method": "GET",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/provider/collection/10",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"provider",
								"collection",
								"10"
							]
						}
					},
					"response": []
				},
				{
					"name": "create bulk Content",
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQwLCJuYW1lIjoiU3VyYWogcHJvdmlkZXIiLCJlbWFpbCI6InN1cmFqXzEyM0BnbWFpbC5jb20iLCJtb2JpbGUiOm51bGwsInBhc3N3b3JkIjoiJDJiJDEwJDNqbHFWNHJOV0REbXc5Y2EuaEFzWU9wWFdCOHlGTmhONlI5L2o1Z0htTDRBVUNBYXRveDZhIiwicm9sZSI6InByb3ZpZGVyIiwiYXBwcm92ZWQiOnRydWUsImVuYWJsZSI6dHJ1ZSwiaWF0IjoxNzE1NjYwNDI0LCJleHAiOjE3MjQzMDA0MjR9.wtjgQtTquMDoYRG0LjG96XgrEN4vjpDa16pO_O3IHy0",
									"type": "string"
								}
							]
						},
						"method": "POST",
						"header": [],
						"body": {
							"mode": "formdata",
							"formdata": [
								{
									"key": "file",
									"type": "file",
									"src": "/home/ttpl-rt-085/Documents/onest-content.csv"
								}
							]
						},
						"url": {
							"raw": "{{base_url}}/provider/createBulkContent",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"provider",
								"createBulkContent"
							]
						}
					},
					"response": []
				},
				{
					"name": "search collection",
					"request": {
						"auth": {
							"type": "noauth"
						},
						"method": "POST",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"title\": \"cat stories\"\n    \n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/seeker/searchCollection",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"seeker",
								"searchCollection"
							]
						}
					},
					"response": []
				},
				{
					"name": "upload image",
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzUsIm5hbWUiOiJTdXJhaiBLdW1hciIsImVtYWlsIjoic3VyYWoxMjNAZ21haWwuY29tIiwibW9iaWxlIjpudWxsLCJwYXNzd29yZCI6IiQyYiQxMCR5Nk9QTDVLU3MvVDQuRTVpVUE3c2h1enVzbDAzV3U3NEZuUjNSNzh5YjgzbGFzdi8yWGZRLiIsInJvbGUiOiJwcm92aWRlciIsImFwcHJvdmVkIjp0cnVlLCJlbmFibGUiOnRydWUsImlhdCI6MTY5NTk3NzA1NiwiZXhwIjoxNzA0NjE3MDU2fQ.F6RAw0AkuBVOcPvYz4ScT3PeoSaUlhZk6IwAkhxK4rE",
									"type": "string"
								}
							]
						},
						"method": "POST",
						"header": [],
						"body": {
							"mode": "formdata",
							"formdata": [
								{
									"key": "file",
									"type": "file",
									"src": "/home/ttpl-rt-085/Downloads/food.png"
								}
							]
						},
						"url": {
							"raw": "{{base_url}}/provider/uploadImage",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"provider",
								"uploadImage"
							]
						}
					},
					"response": []
				},
				{
					"name": "delete Content",
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTcsIm5hbWUiOiJTdXJhaiBLdW1hciIsImVtYWlsIjoic3VyYWpfMTIzQGdtYWlsLmNvbSIsIm1vYmlsZSI6bnVsbCwicGFzc3dvcmQiOiIkMmIkMTAkZlNOc1NySDNKTTZjMkd1eTdlTEN5ZTk4S1FSY2lacS80Lmc1WHVDZThMNEduV0ZIWDV4bEsiLCJyb2xlIjoicHJvdmlkZXIiLCJhcHByb3ZlZCI6dHJ1ZSwiZW5hYmxlIjp0cnVlLCJpYXQiOjE3MjM1MjcyMDYsImV4cCI6MTczMjE2NzIwNn0.9fc80Bok5ysjyyeRE3xY4YiZcRJA27YRJd9XsCKWC34",
									"type": "string"
								}
							]
						},
						"method": "DELETE",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/provider/content/77",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"provider",
								"content",
								"77"
							]
						}
					},
					"response": []
				},
				{
					"name": "Get Content by id",
					"protocolProfileBehavior": {
						"disableBodyPruning": true
					},
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzUsIm5hbWUiOiJTdXJhaiBLdW1hciIsImVtYWlsIjoic3VyYWoxMjNAZ21haWwuY29tIiwibW9iaWxlIjpudWxsLCJwYXNzd29yZCI6IiQyYiQxMCR5Nk9QTDVLU3MvVDQuRTVpVUE3c2h1enVzbDAzV3U3NEZuUjNSNzh5YjgzbGFzdi8yWGZRLiIsInJvbGUiOiJwcm92aWRlciIsImFwcHJvdmVkIjp0cnVlLCJlbmFibGUiOnRydWUsImlhdCI6MTY5NTk3NzA1NiwiZXhwIjoxNzA0NjE3MDU2fQ.F6RAw0AkuBVOcPvYz4ScT3PeoSaUlhZk6IwAkhxK4rE",
									"type": "string"
								}
							]
						},
						"method": "GET",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/provider/contentById/12",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"provider",
								"contentById",
								"12"
							]
						}
					},
					"response": []
				},
				{
					"name": "get imageUrl",
					"protocolProfileBehavior": {
						"disableBodyPruning": true
					},
					"request": {
						"auth": {
							"type": "noauth"
						},
						"method": "GET",
						"header": [],
						"body": {
							"mode": "formdata",
							"formdata": [
								{
									"key": "file",
									"type": "file",
									"src": "/home/ttpl-rt-085/Pictures/Screenshot from 2023-07-31 17-54-12.png",
									"disabled": true
								}
							]
						},
						"url": {
							"raw": "{{base_url}}/provider/getImageUrl/screenshotfrom2023-08-0323-16-141702708873105.png",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"provider",
								"getImageUrl",
								"screenshotfrom2023-08-0323-16-141702708873105.png"
							],
							"query": [
								{
									"key": "id",
									"value": "screenshotfrom2023-07-3117-54-121698731392391.png",
									"disabled": true
								}
							]
						}
					},
					"response": []
				},
				{
					"name": "create scholarship",
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzUsIm5hbWUiOiJTdXJhaiBLdW1hciIsImVtYWlsIjoic3VyYWoxMjNAZ21haWwuY29tIiwibW9iaWxlIjpudWxsLCJwYXNzd29yZCI6IiQyYiQxMCR5Nk9QTDVLU3MvVDQuRTVpVUE3c2h1enVzbDAzV3U3NEZuUjNSNzh5YjgzbGFzdi8yWGZRLiIsInJvbGUiOiJwcm92aWRlciIsImFwcHJvdmVkIjp0cnVlLCJlbmFibGUiOnRydWUsImlhdCI6MTY5NTk3NzA1NiwiZXhwIjoxNzA0NjE3MDU2fQ.F6RAw0AkuBVOcPvYz4ScT3PeoSaUlhZk6IwAkhxK4rE",
									"type": "string"
								}
							]
						},
						"method": "POST",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"domain\": \"finance\",\n    \"name\": \"buddyforstudy2\",\n    \"description\": \"This is description for buddy for study\",\n    \"provider\": \"Tekdi\",\n    \"creator\": \"Suraj\",\n    \"category\": \"scholarship\",\n    \"applicationDeadline\": \"xyz\",\n    \"amount\": 10000,\n    \"duration\": \"1 month\",\n    \"eligibilityCriteria\": \"BE\",\n    \"applicationProcessing\": \"abc\",\n    \"selectionCriteria\": \"Graduate\",\n    \"noOfRecipients\": \"5\",\n    \"termsAndConditions\": \"This is terms and condition for this\",\n    \"additionalResources\": \"required\",\n    \"applicationForm\": \"filled\",\n    \"applicationSubmissionDate\": \"10-11-2023\",\n    \"contactInformation\": \"mobile no\",\n    \"status\": \"eligible\",\n    \"keywords\": \"scholarship\"\n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/provider/scholarship",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"provider",
								"scholarship"
							]
						}
					},
					"response": []
				},
				{
					"name": "get scholarship",
					"protocolProfileBehavior": {
						"disableBodyPruning": true
					},
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzUsIm5hbWUiOiJTdXJhaiBLdW1hciIsImVtYWlsIjoic3VyYWoxMjNAZ21haWwuY29tIiwibW9iaWxlIjpudWxsLCJwYXNzd29yZCI6IiQyYiQxMCR5Nk9QTDVLU3MvVDQuRTVpVUE3c2h1enVzbDAzV3U3NEZuUjNSNzh5YjgzbGFzdi8yWGZRLiIsInJvbGUiOiJwcm92aWRlciIsImFwcHJvdmVkIjp0cnVlLCJlbmFibGUiOnRydWUsImlhdCI6MTY5NTk3NzA1NiwiZXhwIjoxNzA0NjE3MDU2fQ.F6RAw0AkuBVOcPvYz4ScT3PeoSaUlhZk6IwAkhxK4rE",
									"type": "string"
								}
							]
						},
						"method": "GET",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/provider/scholarship",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"provider",
								"scholarship"
							]
						}
					},
					"response": []
				},
				{
					"name": "get scholarship by id",
					"protocolProfileBehavior": {
						"disableBodyPruning": true
					},
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzUsIm5hbWUiOiJTdXJhaiBLdW1hciIsImVtYWlsIjoic3VyYWoxMjNAZ21haWwuY29tIiwibW9iaWxlIjpudWxsLCJwYXNzd29yZCI6IiQyYiQxMCR5Nk9QTDVLU3MvVDQuRTVpVUE3c2h1enVzbDAzV3U3NEZuUjNSNzh5YjgzbGFzdi8yWGZRLiIsInJvbGUiOiJwcm92aWRlciIsImFwcHJvdmVkIjp0cnVlLCJlbmFibGUiOnRydWUsImlhdCI6MTY5NTk3NzA1NiwiZXhwIjoxNzA0NjE3MDU2fQ.F6RAw0AkuBVOcPvYz4ScT3PeoSaUlhZk6IwAkhxK4rE",
									"type": "string"
								}
							]
						},
						"method": "GET",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/provider/scholarship/1",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"provider",
								"scholarship",
								"1"
							]
						}
					},
					"response": []
				},
				{
					"name": "edit scholarship by id",
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzUsIm5hbWUiOiJTdXJhaiBLdW1hciIsImVtYWlsIjoic3VyYWoxMjNAZ21haWwuY29tIiwibW9iaWxlIjpudWxsLCJwYXNzd29yZCI6IiQyYiQxMCR5Nk9QTDVLU3MvVDQuRTVpVUE3c2h1enVzbDAzV3U3NEZuUjNSNzh5YjgzbGFzdi8yWGZRLiIsInJvbGUiOiJwcm92aWRlciIsImFwcHJvdmVkIjp0cnVlLCJlbmFibGUiOnRydWUsImlhdCI6MTY5NTk3NzA1NiwiZXhwIjoxNzA0NjE3MDU2fQ.F6RAw0AkuBVOcPvYz4ScT3PeoSaUlhZk6IwAkhxK4rE",
									"type": "string"
								}
							]
						},
						"method": "PATCH",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"name\": \"buddyforstudy.com\",\n    \"provider\": \"Tekdi\",\n    \"selectionCriteria\": \"Graduate\",\n    \"status\": \"eligible\",\n    \"termsAndConditions\": \"This is terms and condition for this\",\n    \"keywords\": \"scholarship\",\n    \"noOfRecipients\": \"5\",\n    \"eligibilityCriteria\": \"BE\",\n    \"duration\": \"1 month\",\n    \"domain\": \"finance\",\n    \"description\": \"This is description for buddy for study\",\n    \"creator\": \"Suraj\",\n    \"contactInformation\": \"mobile no\",\n    \"category\": \"scholarship\",\n    \"applicationSubmissionDate\": \"10-11-2023\",\n    \"applicationProcessing\": \"abc\",\n    \"applicationForm\": \"filled\",\n    \"applicationDeadline\": \"31-12-2023\",\n    \"amount\": 20000\n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/provider/scholarship/1",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"provider",
								"scholarship",
								"1"
							]
						}
					},
					"response": []
				},
				{
					"name": "update profile",
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQwLCJuYW1lIjoiU3VyYWogcHJvdmlkZXIiLCJlbWFpbCI6InN1cmFqXzEyM0BnbWFpbC5jb20iLCJtb2JpbGUiOm51bGwsInBhc3N3b3JkIjoiJDJiJDEwJDNqbHFWNHJOV0REbXc5Y2EuaEFzWU9wWFdCOHlGTmhONlI5L2o1Z0htTDRBVUNBYXRveDZhIiwicm9sZSI6InByb3ZpZGVyIiwiYXBwcm92ZWQiOnRydWUsImVuYWJsZSI6dHJ1ZSwiaWF0IjoxNzE2NTQ5MjkxLCJleHAiOjE3MjUxODkyOTF9.BFsTMI-fUJWzeK1O7XTLLYtNwCo-zkJigkNDOwiY5gE",
									"type": "string"
								}
							]
						},
						"method": "PATCH",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"categories\": [{\"id\":\"1\",\"descriptor\":{\"code\":\"course\",\"name\":\"Course\"}},{\"id\":\"2\",\"descriptor\":{\"code\":\"others\",\"name\":\"Others\"}}],\n    \"fulfillments\": [{\"id\":\"1\",\"type\":\"ONLINE\",\"tracking\":false},{\"id\":\"2\",\"type\":\"IN-PERSON\",\"tracking\":false},{\"id\":\"3\",\"type\":\"HYBRID\",\"tracking\":false}],\n    \"image\": \"tekdi_log01716195468125.png\",\n    \"description\": \"This is test provider\"\n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/provider/profile",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"provider",
								"profile"
							]
						}
					},
					"response": []
				},
				{
					"name": "get profile",
					"protocolProfileBehavior": {
						"disableBodyPruning": true
					},
					"request": {
						"auth": {
							"type": "bearer",
							"bearer": [
								{
									"key": "token",
									"value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTQwLCJuYW1lIjoiU3VyYWogcHJvdmlkZXIiLCJlbWFpbCI6InN1cmFqXzEyM0BnbWFpbC5jb20iLCJtb2JpbGUiOm51bGwsInBhc3N3b3JkIjoiJDJiJDEwJDNqbHFWNHJOV0REbXc5Y2EuaEFzWU9wWFdCOHlGTmhONlI5L2o1Z0htTDRBVUNBYXRveDZhIiwicm9sZSI6InByb3ZpZGVyIiwiYXBwcm92ZWQiOnRydWUsImVuYWJsZSI6dHJ1ZSwiaWF0IjoxNzE2NTQ5MjkxLCJleHAiOjE3MjUxODkyOTF9.BFsTMI-fUJWzeK1O7XTLLYtNwCo-zkJigkNDOwiY5gE",
									"type": "string"
								}
							]
						},
						"method": "GET",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/provider/profile",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"provider",
								"profile"
							]
						}
					},
					"response": []
				}
			]
		},
		{
			"name": "auth",
			"item": [
				{
					"name": "login",
					"request": {
						"method": "POST",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"username\":\"suraj_123@gmail.com\",\n    \"password\":\"654321\",\n    \"role\": \"provider\"\n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/auth/login",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"auth",
								"login"
							]
						}
					},
					"response": []
				},
				{
					"name": "provider & seeker Resgister",
					"request": {
						"method": "POST",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"name\":\"Suraj seeker\",\n    \"email\":\"suraj_seeker@gmail.com\",\n    \"password\":\"123456\",\n    \"role\":\"seeker\",\n    \"organization\":\"Tekdi\",\n    \"source_code\":\"KA\"\n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/auth/registerUser",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"auth",
								"registerUser"
							]
						}
					},
					"response": []
				}
			]
		},
		{
			"name": "dsep",
			"item": [
				{
					"name": "content search",
					"request": {
						"method": "POST",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"context\": {\n        \"domain\": \"onest:learning-experiences\",\n        \"action\": \"search\",\n        \"version\": \"1.1.0\",\n        \"bap_id\": \"a632-114-143-119-218.ngrok-free.app\",\n        \"bap_uri\": \"https://a632-114-143-119-218.ngrok-free.app\",\n        \n        \"transaction_id\": \"{{$randomUUID}}\",\n        \"message_id\": \"{{$randomUUID}}\",\n        \"timestamp\": \"2023-02-06T09:55:41.161Z\"\n    },\n    \"message\": {\n        \"intent\": {\n            \"item\": {\n                \"descriptor\": {\n                    \"name\": \"\"\n                }\n            }\n        }\n    }\n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/dsep/search",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"dsep",
								"search"
							]
						}
					},
					"response": []
				},
				{
					"name": "content select",
					"request": {
						"method": "POST",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"context\": {\n        \"domain\": \"onest:learning-experiences\",\n        \"action\": \"select\",\n        \"version\": \"1.1.0\",\n        \"bap_id\": \"vistaar-bap.tekdinext.com\",\n        \"bap_uri\": \"https://vistaar-bap.tekdinext.com\",\n        \"bpp_id\": \"icar.tekdinext.com\",\n        \"bpp_uri\": \"https://icar.tekdinext.com\",\n        \"transaction_id\": \"a9aaecca-10b7-4d19-b640-b047a7c60019\",\n        \"message_id\": \"a9aaecca-10b7-4d19-b640-b047a7c60019\",\n        \"timestamp\": \"2023-02-06T09:55:41.161Z\"\n    },\n    \"message\": {\n        \"order\": {\n            \"provider\": {\n                \"id\": \"142\"\n            },\n            \"items\": [\n                {\n                    \"id\": \"332\"\n                }\n            ]\n        }\n    }\n}",
							"options": {
								"raw": {
									"language": "json"
								}
							}
						},
						"url": {
							"raw": "{{base_url}}/dsep/select",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"dsep",
								"select"
							]
						}
					},
					"response": []
				},
				{
					"name": "content Init",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json",
								"type": "text"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"context\": {\n        \"domain\": \"onest:learning-experiences\",\n        \"action\": \"select\",\n        \"version\": \"1.1.0\",\n        \"bap_id\": \"vistaar-bap.tekdinext.com\",\n        \"bap_uri\": \"https://vistaar-bap.tekdinext.com\",\n        \"bpp_id\": \"icar.tekdinext.com\",\n        \"bpp_uri\": \"https://icar.tekdinext.com\",\n        \"transaction_id\": \"a9aaecca-10b7-4d19-b640-b047a7c60019\",\n        \"message_id\": \"a9aaecca-10b7-4d19-b640-b047a7c60019\",\n        \"timestamp\": \"2023-02-06T09:55:41.161Z\"\n    },\n    \"message\": {\n        \"order\": {\n            \"items\": [\n                {\n                    \"id\": \"241\"\n                }\n            ],\n            \"fulfillments\": [\n                {\n                    \"agent\": {\n                        \"person\": {\n                            \"name\": \"\",\n                            \"gender\": \"\",\n                            \"age\": \"\"\n                        },\n                        \"contact\": {\n                            \"phone\": \"\",\n                            \"email\": \"\"\n                        }\n                    }\n                }\n            ]\n        }\n    }\n}"
						},
						"url": {
							"raw": "{{base_url}}/dsep/init",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"dsep",
								"init"
							]
						}
					},
					"response": []
				},
				{
					"name": "coontent Confirm",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json",
								"type": "text"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"context\": {\n        \"domain\": \"onest:learning-experiences\",\n        \"action\": \"select\",\n        \"version\": \"1.1.0\",\n        \"bap_id\": \"vistaar-bap.tekdinext.com\",\n        \"bap_uri\": \"https://vistaar-bap.tekdinext.com\",\n        \"bpp_id\": \"icar.tekdinext.com\",\n        \"bpp_uri\": \"https://icar.tekdinext.com\",\n        \"transaction_id\": \"a9aaecca-10b7-4d19-b640-b047a7c60019\",\n        \"message_id\": \"a9aaecca-10b7-4d19-b640-b047a7c60019\",\n        \"timestamp\": \"2023-02-06T09:55:41.161Z\"\n    },\n    \"message\": {\n        \"order\": {\n            \"items\": [\n                {\n                    \"id\": \"338\",\n                    \"quantity\": {\n                        \"maximum\": {\n                            \"count\": 1\n                        }\n                    },\n                    \"parent_item_id\": \"241\",\n                    \"descriptor\": {\n                        \"name\": \"Test\",\n                        \"short_desc\": \"Test\",\n                        \"long_desc\": \"Test\",\n                        \"images\": [\n                            {\n                                \"url\": \"https://image/plant1703059008689.jpg\"\n                            }\n                        ],\n                        \"media\": [\n                            {\n                                \"url\": \"https://image/plant1703059008689.jpg\"\n                            }\n                        ]\n                    },\n                    \"creator\": {\n                        \"descriptor\": {\n                            \"name\": \"Viod\"\n                        }\n                    },\n                    \"price\": {\n                        \"currency\": \"INR\",\n                        \"value\": \"0\"\n                    },\n                    \"category_ids\": [\n                        \"Toys and Games\"\n                    ],\n                    \"rating\": \"NaN\",\n                    \"rateable\": true,\n                    \"add-ons\": [\n                        {\n                            \"descriptor\": {\n                                \"media\": [\n                                    {\n                                        \"mimetype\": \"image/jpg\",\n                                        \"url\": \"https://diksha.gov.in/play/questionset/do_3138338770704957441299\"\n                                    }\n                                ]\n                            }\n                        }\n                    ],\n                    \"tags\": [\n                        {\n                            \"display\": true,\n                            \"descriptor\": {\n                                \"name\": \"courseInfo\",\n                                \"code\": \"courseInfo\",\n                                \"list\": [\n                                    {\n                                        \"display\": true,\n                                        \"descriptor\": {\n                                            \"code\": \"sourceOrganisation\",\n                                            \"name\": \"Source Organisation\"\n                                        },\n                                        \"value\": \"ekstep\"\n                                    },\n                                    {\n                                        \"display\": true,\n                                        \"descriptor\": {\n                                            \"code\": \"competency\",\n                                            \"name\": \"Competency\"\n                                        },\n                                        \"value\": \"competency\"\n                                    },\n                                    {\n                                        \"display\": true,\n                                        \"descriptor\": {\n                                            \"code\": \"contentType\",\n                                            \"name\": \"Content Type\"\n                                        },\n                                        \"value\": \"contentType\"\n                                    },\n                                    {\n                                        \"display\": true,\n                                        \"descriptor\": {\n                                            \"code\": \"domain\",\n                                            \"name\": \"Domain\"\n                                        },\n                                        \"value\": \"Physical Development\"\n                                    },\n                                    {\n                                        \"display\": true,\n                                        \"descriptor\": {\n                                            \"code\": \"curriculargoal\",\n                                            \"name\": \"Curricular Goal\"\n                                        },\n                                        \"value\": \"curriculargoal\"\n                                    },\n                                    {\n                                        \"display\": true,\n                                        \"descriptor\": {\n                                            \"code\": \"language\",\n                                            \"name\": \"Language\"\n                                        },\n                                        \"value\": \"English\"\n                                    },\n                                    {\n                                        \"display\": true,\n                                        \"descriptor\": {\n                                            \"code\": \"themes\",\n                                            \"name\": \"Themes\"\n                                        },\n                                        \"value\": \"themes\"\n                                    },\n                                    {\n                                        \"display\": true,\n                                        \"descriptor\": {\n                                            \"code\": \"minAge\",\n                                            \"name\": \"minAge\"\n                                        },\n                                        \"value\": \"10\"\n                                    },\n                                    {\n                                        \"display\": true,\n                                        \"descriptor\": {\n                                            \"code\": \"maxAge\",\n                                            \"name\": \"maxAge\"\n                                        },\n                                        \"value\": \"10\"\n                                    },\n                                    {\n                                        \"display\": true,\n                                        \"descriptor\": {\n                                            \"code\": \"author\",\n                                            \"name\": \"author\"\n                                        },\n                                        \"value\": \"Viod\"\n                                    },\n                                    {\n                                        \"display\": true,\n                                        \"descriptor\": {\n                                            \"code\": \"curricularGoals\",\n                                            \"name\": \"curricularGoals\"\n                                        },\n                                        \"value\": \"curricularGoals\"\n                                    },\n                                    {\n                                        \"display\": true,\n                                        \"descriptor\": {\n                                            \"code\": \"learningOutcomes\",\n                                            \"name\": \"learningOutcomes\"\n                                        },\n                                        \"value\": \"learningOutcomes\"\n                                    },\n                                    {\n                                        \"display\": true,\n                                        \"descriptor\": {\n                                            \"code\": \"persona\",\n                                            \"name\": \"persona\"\n                                        },\n                                        \"value\": \"persona\"\n                                    },\n                                    {\n                                        \"display\": true,\n                                        \"descriptor\": {\n                                            \"code\": \"license\",\n                                            \"name\": \"license\"\n                                        },\n                                        \"value\": \"license\"\n                                    },\n                                    {\n                                        \"display\": true,\n                                        \"descriptor\": {\n                                            \"code\": \"createdon\",\n                                            \"name\": \"createdon\"\n                                        },\n                                        \"value\": \"2023-12-20T07:58:25.356706+00:00\"\n                                    },\n                                    {\n                                        \"display\": true,\n                                        \"descriptor\": {\n                                            \"code\": \"lastupdatedon\",\n                                            \"name\": \"lastupdatedon\"\n                                        },\n                                        \"value\": \"2023-12-20T07:58:25.356706+00:00\"\n                                    }\n                                ]\n                            }\n                        }\n                    ],\n                    \"xinput\": {\n                        \"head\": {\n                            \"descriptor\": {\n                                \"name\": \"Application Form\"\n                            },\n                            \"index\": {\n                                \"min\": 0,\n                                \"cur\": 1,\n                                \"max\": 1\n                            }\n                        },\n                        \"form\": {\n                            \"url\": \"https://onest-bap.tekdinext.com/submit/241\",\n                            \"mime_type\": \"text/html\",\n                            \"resubmit\": false,\n                            \"submission_id\":\"0d34f0d1-4950-47c0-baf9-50933e8e1941\"\n                        },\n                        \"required\": true\n                    }\n                }\n            ],\n            \"fulfillments\": [\n                {\n                    \"customer\": {\n                        \"person\": {\n                            \"name\": \"Alice Joy1\",\n                            \"gender\": \"male\",\n                            \"languages\": [],\n                            \"age\": \"\",\n                            \"skills\": [],\n                            \"tags\": [\n                                {\n                                    \"code\": \"distributor-details\",\n                                    \"list\": [\n                                        {\n                                            \"descriptor\": {\n                                                \"code\": \"distributor-name\",\n                                                \"name\": \"Distributor Name\"\n                                            },\n                                            \"value\": \"dlexp\"\n                                        },\n                                        {\n                                            \"descriptor\": {\n                                                \"code\": \"agent-id\",\n                                                \"name\": \"Agent Id\"\n                                            },\n                                            \"value\": \"tek-agent\"\n                                        }\n                                    ]\n                                }\n                            ]\n                        },\n                        \"contact\": {\n                            \"phone\": \"9988776677\",\n                            \"email\": \"alice1@gmail.com\"\n                        }\n                    }\n                }\n            ]\n        }\n    }\n}"
						},
						"url": {
							"raw": "{{base_url}}/dsep/confirm",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"dsep",
								"confirm"
							]
						}
					},
					"response": []
				},
				{
					"name": "coontent status",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json",
								"type": "text"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"context\": {\n    \"domain\": \"onest:learning-experiences\",\n    \"action\": \"status\",\n    \"version\": \"1.1.0\",\n    \"bap_uri\": \"https://sample.bap.io/\",\n    \"bap_id\": \"sample.bap.io\",\n    \"bpp_id\": \"sample.bpp.io\",\n    \"bpp_uri\": \"https://sample.bpp.io\",\n    \"transaction_id\": \"a9aaecca-10b7-4d19-b640-b047a7c62196\",\n    \"message_id\": \"$bb579fb8-cb82-4824-be12-fcbc405b6608\",\n    \"timestamp\": \"2022-12-12T09:55:41.161Z\",\n    \"ttl\": \"PT10M\"\n  },\n  \"message\": {\n        \"order_id\": \"TLEXP_75630400\"\n    }\n}"
						},
						"url": {
							"raw": "{{base_url}}/dsep/status",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"dsep",
								"status"
							]
						}
					},
					"response": []
				},
				{
					"name": "{{base_url}}/submit-init/241",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Accept",
								"value": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
							},
							{
								"key": "Accept-Language",
								"value": "en-US,en;q=0.9"
							},
							{
								"key": "Cache-Control",
								"value": "max-age=0"
							},
							{
								"key": "Connection",
								"value": "keep-alive"
							},
							{
								"key": "Content-Type",
								"value": "application/x-www-form-urlencoded"
							},
							{
								"key": "Cookie",
								"value": "_ga_9BT7SEDEHL=GS1.1.1708523485.2.0.1708523485.0.0.0; _ga_6ZCF15ZBPC=GS1.1.1712166167.86.0.1712167800.60.0.1420638356; _ga_G0PEZVD4KD=GS1.1.1712166168.37.0.1712167800.0.0.0; _ga=GA1.2.1810406204.1704887413; _gid=GA1.2.1678672879.1714833146; _ga_HZK5VYWFQ6=GS1.1.1714833145.49.1.1714833292.0.0.0"
							},
							{
								"key": "Origin",
								"value": "https://onest-bap.tekdinext.com"
							},
							{
								"key": "Referer",
								"value": "https://onest-bap.tekdinext.com/submit/241"
							},
							{
								"key": "Sec-Fetch-Dest",
								"value": "document"
							},
							{
								"key": "Sec-Fetch-Mode",
								"value": "navigate"
							},
							{
								"key": "Sec-Fetch-Site",
								"value": "same-origin"
							},
							{
								"key": "Sec-Fetch-User",
								"value": "?1"
							},
							{
								"key": "Upgrade-Insecure-Requests",
								"value": "1"
							},
							{
								"key": "User-Agent",
								"value": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
							},
							{
								"key": "sec-ch-ua",
								"value": "\"Not A(Brand\";v=\"99\", \"Google Chrome\";v=\"121\", \"Chromium\";v=\"121\""
							},
							{
								"key": "sec-ch-ua-mobile",
								"value": "?0"
							},
							{
								"key": "sec-ch-ua-platform",
								"value": "\"Linux\""
							}
						],
						"body": {
							"mode": "urlencoded",
							"urlencoded": [
								{
									"key": "name",
									"value": "Suraj Kumar",
									"type": "text"
								},
								{
									"key": "email",
									"value": "mysuraj540@gmail.com",
									"type": "text"
								},
								{
									"key": "gender",
									"value": "Male",
									"type": "text"
								},
								{
									"key": "country code",
									"value": "+91",
									"type": "text"
								},
								{
									"key": "phone",
									"value": "8553444073",
									"type": "text"
								}
							]
						},
						"url": {
							"raw": "{{base_url}}/submit-init/241",
							"host": [
								"{{base_url}}"
							],
							"path": [
								"submit-init",
								"241"
							]
						}
					},
					"response": []
				}
			]
		}
	]
}

