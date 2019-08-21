---
layout: post
title: 人工智能概述笔记
tags: [Artificial Intelligence, Machine Learning, Big Data]
---


### 目录
 - 什么是人工智能
	- 数据挖掘
	 - 机器学习
		 - 机器学习是什么
		 - 机器学习的概念： 问题类型
		 - 机器学习的概念： 训练和推理
		 - 机器学习算法类别
	 - 深度学习	
	 - 云计算
	 - 机器学习 - 其他
	 - 数据科学工作流程
	 - AI领域关键角色和技能
- 人工智能产业发展情况
	- 产业图
	- 目前人工智能领域存在问题
 

# 什么是人工智能
提到人工智能，经常提到数据挖掘，机器学习，深度学习，云计算和人工智能。他们到底是什么。

## 数据挖掘

**数据挖掘**： 识别出巨量数据中有效的、新颖的、潜在有用的、最终可理解的模式的非平凡过程
**简言之**： 从海量数据中找出有用的知识。

1989年8月，第11届国际人工智能联合会议在美国底特律举行，GTE实验室组织了一个名为“在数据库中发现知识” （knowledge discovery in database，KDD）的研讨会，数据挖掘成为一个领域的标志。

数据挖掘的定义分为广义的和狭义的。
- 广义的数据挖掘视为KDD的同义词，广义的数据挖掘也包括数据分析的含义。
- 狭义的数据挖掘视为KDD过程的一个步骤（建模）。

## 机器学习
### 机器学习是什么

> A computer program is said to learn from experience E with respect to some class of tasks T and performance measure P if its performance at tasks in T, as measured by P, improves with experience E. (Tom M. Mitchell,1997)

>一个程序被认为能从经验E中学习，解决任务T，达到性能P，当且仅当，有了经验E后，经过P评审，程序在处理T时性能有所提升。  (Tom M. Mitchell,1997)

![E-T-P](/img/deeplearning-brief-notes/Machine-Learning-Definition-ETP-Framework.png)


### 机器学习的概念： 问题类型
- 回归 (Regression)
- 分类(Classification)
- 聚类 (Clustering)

![classification regression and clustering](/img/deeplearning-brief-notes/Regression-Class-Clustering-graph.png)
- 异常检测 (Anomaly Decation)
![anomaly detection](/img/deeplearning-brief-notes/DBSCAN.png)
- 强化学习 (Reinforcement Learning)
![Reinforcement Learning](/img/deeplearning-brief-notes/Reinforcement-Learning.png)


### 机器学习的概念： 训练和推理
![DeepLearning Concept](/img/deeplearning-brief-notes/Training-and-Inferece-workflow-diagram.png)

### 机器学习算法类别
 - 监督分类
 - 无监督分类
 - 强化学习

 ![Three-machine-learning-category](/img/deeplearning-brief-notes/Three-machine-learning-category.png)

## 深度学习
属于机器学习的一类模型，通过组合低层特征形成更加抽象的高层表示属性类别或特征，以发现数据的分布式**特征表示**。
 - 前馈神经网络： 输入层、隐藏层、输出层。神经元从输入层开始，接受前一级输入，并输出到下一级，直至输出层，整个网络钟无反馈，可用于有向无环图表示。（“皮肤”表层受刺激，一层层反馈到“大脑”，通过“神经元”传输。）
 ![back propagation](/img/deeplearning-brief-notes/Architecture-of-back-propagation-neural-network-BPNN.png)
 - 卷积神经网络： 多层神经网络，将局部连接、权值共享、亚采样这三种结构思想结合，提取图像/文本特征（图像里面，空间距离较远，相关性就较弱。所以对图像做卷积，从二维信息拉展成一维信息，之后用前馈神经网络）
 ![Convolutional Neural Networks](/img/deeplearning-brief-notes/Convolutional-Neural-Networks.jpeg)
 - 循环神经网络: 一种对序列数据建模的神经网络。一个序列当前的输出与前面的输出也相关。(语音)
 ![Recurrent Neural Networks](/img/deeplearning-brief-notes/Recurrent-Neural-Networks.png)

## 云计算
AWS，Google Cloud，Azure，阿里云以及其他SASS能力服务商。 

## 机器学习 - 其他
- 迁移学习
迁移学习是把已训练好的模型参数迁移到新的模型来帮助新模型训练，可以将已经学到的模型参数通过某种方式来分享给新模型，从而加快并优化模型的学习效率。
![Transfer learning](/img/deeplearning-brief-notes/transfer-learning.png)
- 对抗学习
生成式对抗网络（Generative adversarial nets）核心是对抗式，两个网络互相竞争，一个负责生成样本，另一个负责判别样本。
![Generative adversarial nets](/img/deeplearning-brief-notes/Generative-adversarial-nets.jpg)

## 数据科学工作流程

1. 问题定义 - 设定目标，将业务问题转化为数据可表达的问题 （哪一类问题）
2. 数据采集 - 定义梳理用于解决问题的数据，并进行数据采集
3. 数据分析及处理 - 对数据进行清洗和处理，分析数据，选择对解决问题有益的特征数据
4. 建模 - 利用处理好的数据，建立数学模型来解决问题
5. 验证 - 分析算法的性能，对于生产来说是否够好，是否在合理的时间内完成
6. 决策和部署 - 能否实时完成、可否定期重训练、与现有生产系统对接的问题

## AI领域关键角色和技能

| | 产品经理 | 统计学家 |算法工程师|数据工程师 |软件工程师 |
| :-----| :----: | :----: | :----: | :----: | :----: |
| 沟通/讲故事 | √ |  | | | |
| 领域知识 | √ |  | | | |
|  数据整理 |  |  |√ |√ |√ |
| 统计 |  | √ |√ |√ | |
|  建模 |  | √ |√ | | |
| 软件工程 |  |  | | |√ |




# 人工智能产业发展情况

- 国外巨头垄断底层核心技术：底层硬件和开源框架上投入大、技术壁垒高，以国外巨头为主。
- 国内在能力和应用层不断突破：国内依靠场景规模优势，在核心能力和上层应用领域快速发展。
- 行业巨头依托平台构建生态：各巨头公司分别依托优势领域，建设AI开放创新平台，将各自优势AI能力向全社会开放，推进人工智能创新应用，促进人工智能与实体经济深度融合，引领带动智能经济和智能社会发展。

## 产业图

![产业报告](/img/deeplearning-brief-notes/ai-ecosystem-china.png)

## 目前人工智能领域存在问题
- 依赖大量的标注数据
- “弱人工智能” 训练完成特定的任务
- 不够稳定，安全
- 不具备解释能力，模型不透明



