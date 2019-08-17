---
layout: post
title: 用Amazon Lex搭建Twilio媒体流的对话界面
tags: [Artificial Intelligence, Amazon Lex, AWS Machine Learning, 翻译]
---

企业使用 [Twilio](https://www.twilio.com/) 平台构建与客户沟通的新方式：无论是通过对话式交互式语音响应 (IVR) 完全自动化餐厅点餐，还是构建下一代高级客服联系中心。 随着 [Media Streams](https://www.twilio.com/media-streams)的推出，Twilio 开启了他们自己的语音平台，该平台可以赋能企业实时访问电话的原始音频流。

用户可以用Media Streams来提高呼叫中心的生产力，通过[Amazon Transcribe Streaming WebSockets](https://aws.amazon.com/blogs/aws/amazon-transcribe-streaming-now-supports-websockets/)实时翻译对话，自动化终端交互，最后用Amazon分析来访者的语音意图并给客服一些推荐。

在这篇文章里，我们向你展示如何用 [Amazon Lex](https://aws.amazon.com/lex/) 以及Twilio Media Streams提供的原始音频流数据把聊天对话界面(聊天机器人)整合到你的语音应用里去。 Lex 使用深度学习来完成识别人类语音意图所需的繁重工作，以便客户可以轻松地构建愉悦的用户体验和逼真的对话。

解决方案遵循以下步骤:

- 从 Twilio 接收音频流
- 将音频流发送到语音活动检测组件,以确定音频中的是否有语音
- 检测到语音后,开始将用户数据流式传输到 Amazon Lex
- 检测到静音时,停止将用户数据流式传输到 Amazon Lex
- 根据Amazon Lex 的响应更新Twilio正在进行的呼叫

本示例中提供的语音活动检测 (VAD) 实现仅用于参考/演示目的,使用的是通过查看振幅来检测语音和静音的入门方法，不建议用于生产。您需要根据在生产场景中的使用需求来实现更强大可靠的 VAD 模块。


下图描述了步骤:

![lex-twilio-1](/img/lex-twilio/lex-twilio-1.gif)


以下将提供 Amazon Lex Bot 与 Twilio Voice Stream 集成的指导流程：

1. 创建 Amazon Lex Bot
2. 创建 Twilio 帐户和设置可编程语音
3. 构建 Amazon Lex 和 Twilio 语音流集成代码并将其部署到亚马逊 ECS/Fargate
4. 测试已部署的服务
5. (可选) 在本地生成和测试服务

要构建和部署服务,需要以下先决条件:

- [Python](https://www.python.org/downloads/)（用于构建服务的编程语言）
- [Docker](https://www.docker.com/products/docker-desktop)（打包服务的部署工具）
- 已安装并配置 [AWS CLI](https://aws.amazon.com/cli/)（用于创建所需的 AWS 服务并将服务部署到 AWS）。有关说明,请参阅配置 [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html#cli-quick-configuration)

此外,您需要一个域名来托管您的服务，并且必须使用 [Amazon Certificate Manager](https://console.aws.amazon.com/acm/home) 为域名注册 SSL 证书。 有关说明,请参阅[请求公共证书](https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-request-public.html)。从控制台记录证书 ARN。

需要 SSL 证书才能通过**wss**进行安全通信，**wss**是 Twilio 语音流使用的持久双向通信协议。`templates/streams.xml` 文件中的<Stream>指令允许您通过 WebSockets 实时接收原始音频流。成功连接后，您的服务将建立与 Twilio 服务的 WebSocket 连接，音频将开始流式传输。


## 第一步： 创建 Amazon Lex Bot

如果您还没有Amazon Lex Bot，创建并部署一个。有关说明，请参阅[使用蓝图创建 Amazon Lex Bot（控制台）](https://docs.aws.amazon.com/lex/latest/dg/gs-bp.html)。

创建Bot后，部署Bot并创建别名。有关说明，请参阅[发布版本和创建别名](https://docs.aws.amazon.com/lex/latest/dg/gettingstarted-ex3.html)。

为了从服务调用 Amazon Lex API，您必须创建具有访问类型为"Programmatic access"的 IAM 用户并附加相应的策略。

为此，在 AWS 控制台中，点击 **IAM**->**Users**->**Add user**。

提供用户名，选择"Programmatic access"访问类型，然后单击"Next: Permissions"。

![lex-twilio-2](/img/lex-twilio/lex-twilio-2.gif)

使用"Attach existing policies directly"选项，筛选 Amazon Lex 策略并选择 AmazonLexReadOnly 和 AmazonLexRunBotsOnly 策略。

![lex-twilio-3](/img/lex-twilio/lex-twilio-3.gif)

单击以下页面中的"Next: Tags"、"Next: Review"和"Create User"以创建用户。记录访问密钥 ID 和机密访问密钥。我们在部署栈期间使用这些凭据。

## 第二步：创建 Twilio 帐户和设置可编程语音

注册 Twilio 帐户并创建可编程语音项目。 有关注册说明，请参阅https://www.twilio.com/console。

记录"**AUTH TOKEN**"。您可以在 Twilio 仪表板
Setting>General->API Credentials 下找到此信息。

您还必须通过添加用于拨打 Twilio 电话号码的电话号码来验证呼叫者 ID。您可以通过单击  Verify caller ID 页上的按钮 ![red-button.png](/img/lex-twilio/red-button.png)来执行此操作

## 第三步：构建 Amazon Lex 和 Twilio 语音流集成代码并将其部署到亚马逊 ECS/Fargate

在本节中，我们使用 AWS Fargate 创建一个新服务来托管集成代码。 [AWS Fargate](https://aws.amazon.com/fargate/) 是 [Amazon 弹性容器服务](https://aws.amazon.com/ecs/)(ECS)中的一个部署选项，允许您部署容器，而无需担心配置或扩展服务器。对于我们的服务，我们在应用程序负载平衡器 （ALB） 后面的 Docker 容器中使用 Python 和 [Flask](https://palletsprojects.com/p/flask/)。

### 部署核心基础设施
作为创建基础设施的第一步，我们使用CloudFormation Template部署核心基础设施，如 VPC、Subnets、安全组、ALB、ECS 集群和 IAM 策略。

单击下面的"Launch Stack"按钮，即可进入 AWS CloudFormation Stack 创建页面。单击"下一步"并填写参数。请注意，稍后我们启动基础架构之上的服务的过程中使用相同的"EnvironmentName"参数。这允许我们引用此部署的堆栈输出。

[![Launch Stack](/img/lex-twilio/launchstack.png)](https://console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/new?stackName=lex-twiliovoice-core&templateURL=https://aws-ml-blog.s3.amazonaws.com/artifacts/lex-twilio/coreinfra_cfn.yml)

堆栈创建完成后，从"Output"选项卡中记录"ExternalUrl"键的值。

### 将代码打包并部署到AWS
为了将代码部署到 Amazon ECS，我们将代码打包到 Docker 容器中，并将 Docker 映像上载到 Amazon 弹性容器注册表 （ECR）。

服务的代码可在下面的 GitHub repository中找到。请克隆存储库到本地计算机上。

    git clone https://github.com/veerathp/lex-twiliovoice.git
    cd lex-twiliovoice

接下来，我们将更新 `templates/streams.xml` 中 Streams 元素的 URL属性，以匹配在先决条件部分中配置SSL证书的那个服务的DNS名称。

    <Stream url="wss://<Your DNS>/"></Stream>

现在运行下面命令，使用 Dockerfile 生成容器映像。

    docker build -t lex-twiliovoice .

接下来，我们使用 AWS CLI 传入存储库名称的值来创建容器注册表。从输出中记录"repositoryUri"。

    aws ecr create-repository --repository-name <repository name>

为了将容器映像推送到注册表，我们必须进行身份验证。运行以下命令：

    aws ecr get-login --region us-west-2 --no-include-email

执行上述命令的输出以完成身份验证过程。

接下来，我们将容器镜像标记并推送到 ECR。

    docker tag lex-twiliovoice <repositoryUri>/lex-twiliovoice:latest
    docker push <repositoryUri>/lex-twiliovoice:latest

现在，我们使用 CloudFormation Template部署其余的基础架构。作为此堆栈的一部分，我们部署组件，如 ECS Service,，ALB Target groups， HTTP/HTTPS Listener rules 和 Fargate Task。使用task definition properties将环境变量注入容器。

由于我们在我们的服务使用 WebSocket 连接，我们需要启用负载均衡（使用目标组属性）的粘性，以便与同一实例保持持久连接。

    TargetGroup:
        Type: AWS::ElasticLoadBalancingV2::TargetGroup
        Properties:
          ….
          ….
          TargetGroupAttributes:
            - Key: stickiness.enabled
              Value: true
            …

单击下面的"Launch Stack"按钮，即可进入 AWS CloudFormation Stack创建页面。单击"Next"并填写从上述步骤中收集的以下参数的正确值：IAMAccessKeyId, IAMSecretAccessKey, ImageUrl, LexBotName, LexBotAlias, and TwilioAuthToken。其他所有参数您可以使用默认值。请确保使用和上一个堆栈部署相同"EnvironmentName"，因为我们要引用部署的输出。

[![Launch Stack](/img/lex-twilio/launchstack.png)](https://console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/new?stackName=lex-twiliovoice-service&templateURL=https://aws-ml-blog.s3.amazonaws.com/artifacts/lex-twilio/serviceinfra_cfn.yml)

部署完成后，我们可以测试服务。但是，在执行此操作之前，请确保将自定义 DNS 指向应用程序负载平衡器 URL。

为此，我们在 Route 53 Hosted Zones 下创建一个"A Record"，将自定义 DNS 指向作为核心基础架构堆栈部署一部分的 ALB Url（输出中的"ExternalUrl"密钥）。在"Create Record Set"页面中，名称字段使用 DNS 名称，type 选"A + IPv4 address"，Alias字段选择"Yes"， Alias target同ALB Url，然后单击"Create"。

## 第四步：测试已部署的服务

您可以通过导航到 [Amazon ECS Console](https://console.aws.amazon.com/ecs/home)并单击群集名称来验证部署。您可以在"Services"选项卡下看到 AWS Fargate 服务，在"tasks"选项卡下看到正在运行的任务。

![lex-twilio-4](/img/lex-twilio/lex-twilio-4.gif)

为了测试服务，首先我们使用在 AWS 中运行中的服务的 URL（http://<url>/twiml）更新 Twilio 控制台中"Voice & Fax" 部分下的 Webhook URL 字段。您现在可以拨打 Twilio 电话号码来联系Lex Bot。确保使用 Twilio 控制台验证过号码拨打。连接后，您会听到提示"您将与 Lex Bot连接，3，2，1 GO"，这个提示语是在 `templates/streams.xml` 文件中配置的。您现在就可以与Amazon Lex Bot互动啦！

您可以使用"CloudWatch Log Groups" 监控服务，并解决服务运行时可能出现的任何问题。

![lex-twilio-5](/img/lex-twilio/lex-twilio-5.gif)

## 第五步：(可选) 在本地生成和测试服务

现在，服务已经部署和测试，您可能对在本地构建和测试代码有兴趣。为此，打开克隆到本地计算机上的 GitHub 存储库，并使用以下命令安装所有依赖项：

    pip install -r requirements.txt

您可以通过安装"ngrok"在本地测试服务。有关详细信息，请参阅https://ngrok.com/download。此工具可以用一个公有URL暴露本地 Web 服务器。使用它，您就可以测试 Twilio Webhook 集成了。

    ngrok http 8080

![lex-twilio-6](/img/lex-twilio/lex-twilio-6.gif)

接下来，使用正确的 ngrok url 在 `templates/streams.xml` 文件中配置"Stream"元素。

    <Stream url="wss://<xxxxxxxx.ngrok.io>/"></Stream>

此外，我们还需要配置代码中使用的环境变量。在为环境变量提供适当的值后，运行以下命令：

    export AWS_REGION=us-west-2
    export ACCESS_KEY_ID=<Your IAM User Access key ID from Step 1>
    export SECRET_ACCESS_KEY=<Your IAM User Secret Access key from Step 1>
    export LEX_BOT_NAME=<Bot name for the Lex Bot you created in Step 1>
    export LEX_BOT_ALIAS=<Bot Alias for the Lex Bot you created in Step 1>
    export TWILIO_AUTH_TOKEN=<Twilio AUTH TOKEN from Step 2>
    export CONTAINER_PORT=8080
    export URL=<http://xxxxxxxx.ngrok.io> (update with the appropriate url from ngrok)

设置变量后，可以使用以下命令启动服务：

    python server.py

要进行测试，请使用正确的 URL（http://<url>/twiml）在 Twilio 控制台中的"Voice & Fax"下配置 Webhook 字段，如下所示。

![lex-twilio-7](/img/lex-twilio/lex-twilio-7.gif)


从已验证的电话发起对 Twilio 电话号码的呼叫。连接后，您会听到提示"您将与 Lex Bot连接，3，2，1 GO"，这个提示语是在 `templates/streams.xml` 文件中配置的。现在，您可以与您在步骤 1 中创建的 Amazon Lex Bot交互啦。

在本博客文章中，我们展示了如何使用 [Amazon Lex](https://aws.amazon.com/lex/) 将聊天机器人集成到您的语音应用程序中。要了解如何使用 Amazon Lex 构建更多资源，请查看[开发人员资源](https://aws.amazon.com/lex/resources/)。

本文为翻译，原文章地址[按这里]([https://aws.amazon.com/cn/blogs/machine-learning/use-amazon-lex-as-a-conversational-interface-with-twilio-media-streams/](https://aws.amazon.com/cn/blogs/machine-learning/use-amazon-lex-as-a-conversational-interface-with-twilio-media-streams/))