---
layout: post
title: Building Evolutionary Architectures Reading Note I
subtitle: Software Architecture
tags: [架构，读书笔记]
---

evolutionary architecture必须要考虑三个方面：incremental change(增量变化)，fitness function（适应度函数，也可以理解为书中所述的guided change），第三个方面是appropriate coupling（适当的耦合）。

以前我一直认为incremental change只是开发上的事情，其实它也包含团队如何部署这一部分。开发就是指如何让开发人员可以更容易的做增量变化，部署就是指要考虑模块的层级以及对于业务逻辑特性的结偶，并将他们对应的设计好的架构上去。这也是为什么要做DevOps的原因。

第二个方面是Guided Change，作者借用了算法里fitness function概念来描述如何不让evolutinary architecture降级。可以想象一个好的evolutinary architecture由很多特性组成，当有新的变化元素，比如业务需求新功能，加到现有的系统里的时候，我们需要一个机制来防止随着时间推移这些变化影响到这些重要特性。

除了技术架构（Techncal）之外，架构还应该考虑其他维度。作者列出了四种常见的四个维度：
 - Technical
 架构实现部分，比如Frameworks，依赖的包以及需要实现功能所对应的编程语言
 - Data
 Database Schemas， table layourts， 优化等等。DBA架构师需要解决这方面的架构问题
 - Security
 定义安全策略，安全指引以及找到对应的工具帮助发现系统的缺陷
 - Operational/System
 这方面主要考虑的是如何将架构对应到现有的硬件和虚拟机基础设施：比如服务器，集群，交换机和云资源等等

一个项目架构除了软件需求这一特征之外，还有审计，数据，安全，性能，合法性和可扩展性等特征。随着业务需求的不断演进，每一个特征都需要利用fitness function来保证每个特性的完整性。

<img src="/img/20180814/entire_architectural_scope.png"  width="642" height="523">

 > Organization which design systems... are constrained to produce designs which are copies of the communication structures of these organizations.
 >    --Melvin Conway

 作者提到了Conway‘s Law（康威定律)，用来说明架构师不能只注重软件架构，其他方面比如委派分配任务，以及和其他团队的合作都非常重要。其中一句话让我感同身受：it's hard for someone to change something if the thing she wants to change is owned by someone else（如果你想改变的是别人说的算，那真的比登天还难)。 作者想表达的一个点是软件的组织架构（coupling）很重要，不过有时候公司架组织构某种程度上已经决定了软件组织架构。

 下面的章节会分开说incremental change, fitness function 和appropriate coupling。之后合起来讲如何应对系统不断的需求变化。
