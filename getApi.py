from openai import OpenAI

moderation = client.moderations.create(input="I want to kill them.")
print(moderation)

