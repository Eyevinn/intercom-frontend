# URL rewrite for single page applications (SPAs)

CloudFront Functions event type: viewer request

## Creating the function

```
aws cloudformation deploy \
  --region us-east-1 \
  --stack-name url-rewrite-stack \
  --template-file ./url-rewrite-spa.yaml \
  --parameter-overrides AutoPublishParam=true
```
