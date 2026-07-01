# Meeting week 3 Transcript

**Date:** June 19, 2026

**Customer:** Mark Petrov

**Project delivery team:** Ruslan Stetsenko, Lenar Gabdrakhimov, Timur Zainullin, Dinislam Baizigitov

**Original language of interview:** Russian

---

[00:00:03] **Ruslan Stetsenko:** So, today we will show you what we did during this week. That is, we had sprint 1 and we started working on MVP version 1. Now I'm going to start demonstration and show what was. [after 10 seconds] Do you see?

[00:00:36] **Mark Petrov:** Yes, I see.

[00:00:39] **Ruslan Stetsenko:** Well, okay. Firstly, what we planned. Here is a table. That is, on this week for sprint 1 we have chosen 5 points and partially completed them. So, first one is site compliance check. This is the main function to get report for some URL, then PDF-report generation, total possible fine calculation, account creation, and AI-powered verification. That is, these 2 points we also did.

[00:01:26] **Mark Petrov:** Uhum.

[00:01:30] **Ruslan Stetsenko:** Now I will show you the website. Here how it looks like. Let me show you some functionality. Let me type site 'book.ru'. On previous week we already prepared backend. That is we had working crawlers which checked the website but they were not binded with frontend at all. And now, they are connected. Now... Handling is in progress.

[00:02:25] **Mark Petrov:** The design is pretty underwhelming.

[00:02:26] [Someone laughed]

[00:02:30] **Mark Petrov:** Why are you laughing?

[00:02:32] **Ruslan Stetsenko:** Well, sorry-sorry. I just... I didn't think I will conduct this meeting.

[00:02:40] **Mark Petrov:** Well, extemporize.

[00:02:43] **Ruslan Stetsenko:** Here it is. Well, It's just a demo version. Not final one.

[00:02:55] **Mark Petrov:** Of course not final.

[00:02:57] **Ruslan Stetsenko:** So, data is directly from backend are sent here and this how it looks.

[00:03:08] **Mark Petrov:** Uhum.

[00:03:10] **Ruslan Stetsenko:** PDF can not be downloaded yet. Still in developing. You can open some [violations]. Here it is. Also, this week we, my teammates, added authentication and also added backend. And here you can even enter your personal account. No history yet.

[00:03:39] **Mark Petrov:** And verification through email?

[00:03:42] **Ruslan Stetsenko:** And verification through email? Yes we have. Email and password.

[00:03:49] **Mark Petrov:** Well, I'm about verification when you get an email. You talk about authentication now. And when registering? You should add email check.

[00:04:02] **Lenar Gabdrakhimov:** I understood. You want us to send some token of confirmation on email as a letter. But for this we need SMTP-server. We don't have it yet.

[00:04:15] **Mark Petrov:** Message Misha about that. He will provide.

[00:04:18] **Lenar Gabdrakhimov:** Oh, okay then.

[00:04:22] **Ruslan Stetsenko:** Okay, these are main functions I showed. What can you say us about that?

[00:04:40] **Mark Petrov:** Well, product is not for sale. To buy? I don't want. Looks? weak. I don't know about internal functionality but visually bad. You don't have designers in your team right?

[00:05:00] **Ruslan Stetsenko:** In team we don't have any.

[00:05:03] **Mark Petrov:** Take some MCP, like Kombai. And say to it to some cursor... or what model you use there?

[00:05:24] **Ruslan Stetsenko:** To be honest, this front-end I did by Open Code DeepSeek v4.

[00:05:30] **Mark Petrov:** Uh, what DeepSeek? download cursor. There even free versions will be good. And better just buy it's cool for developers. And in cursor add Kombai. Now in another tab open and write in english. [Spelling]

[00:05:49] **Ruslan Stetsenko:** Oh, sorry. So, combine?

[00:06:06] **Mark Petrov:** [Spells product name]. Okay, watch it later. [redacted]. Add it as MCP in cursor and it will make you acceptable design.

[00:06:27] **Ruslan Stetsenko:** Okay, about design...

[00:06:30] **Mark Petrov:** Do you know how to prompt?

[00:06:32] **Lenar Gabdrakhimov:** [Nods laughing].

[00:06:35] **Ruslan Stetsenko:** Well, this I would ask you after the meeting.

[00:06:38] **Mark Petrov:** Well, ask now.

[00:06:40] **Ruslan Stetsenko:** Okay, how do you like it?

[00:06:42] **Mark Petrov:** First of all, follow my telegram channel. I talk about that there. To be serious, advance agents and skills. Install some Caveman for tokens save, Ruflow for agents enrollment and that's it. Write detailed prompt, add some planning mode at normal model. For some feature include some MCP. Well, for an instance, for design is Kombai. It will be good until tokens are ended. And Kombai with planning mode to make how It sees that. Then if you disagree do something, if agree then nice. And model will make you whole design if we speak about design. It will look not bad. Since now it looks not interesting.

[00:07:53] **Ruslan Stetsenko:** Okay we got it. Well, Open Code and DeepSeek we took not from nowhere. It was recomended by course organizator. It was sent to our course chat. I didn't think much.

[00:08:10] **Mark Petrov:** Is it required to use it?

[00:08:12] **Ruslan Stetsenko:** No, it's not neccesary. Just recommendation.

[00:08:13] **Mark Petrov:** So, don't use it. If you are developer, then go on to cursor. Try it's much more convenient model.

[00:08:25] **Ruslan Stetsenko:** Further, I wanted to show you Backlog. We have two backlogs here. Here is everything we did.

[00:08:49] **Mark Petrov:** And no any ready.

[00:08:51] **Ruslan Stetsenko:** No. Here is done. This is done.

[00:08:54] **Mark Petrov:** What's the difference between done and ready?

[00:09:02] **Ruslan Stetsenko:** In fact, no any difference there. Ready should be after review but review we didn't have.

[00:09:10] **Mark Petrov:** It should be like firstly done, then review, and after ready. Well, if you don't need review then think yourself. Ai-powered verification? Oh, it's website check.

[00:09:28] **Ruslan Stetsenko:** Yes, it's website check. AI in backend. Here account creation and so on. I show it since we were told to show it. It's not my will.

[00:09:43] **Mark Petrov:** Oh, then it's not necessary.

[00:09:50] **Ruslan Stetsenko:** So, everything we did except for frontend you approve?

[00:10:03] **Mark Petrov:** Well, probably Yeah... How precisely is scraping and everything which is binded with website check. How precisely it works?

[00:10:23] **Ruslan Stetsenko:** Not me personally built backend. But from my view it's quite qualitative.

[00:10:30] **Mark Petrov:** And from view of that one who built it? Who did it?

[00:10:35] **Timur Zainullin:** I did that.

[00:10:37] **Mark Petrov:** Uhum, tell us.

[00:10:39] **Timur Zainullin:** Do you remember me sending you reports? Initially it was bad, but then I bought paid version and improved prompt and after that results are always succesful. Model has several attempts and if it can not do something or it did not pass something. So, now it passes everything in one attempt. Other models when tested they failed with prompt understanding. [redacted]

[00:11:42] **Mark Petrov:** Do you have any check-list on which you examine your AI?

[00:11:47] **Timur Zainullin:** Yeah we have. everything is indicated in prompt. We also have non AI-powered checks. Yeah AI have some prompt and we check and it verified eveything. If something was not covered then we prompt it again.

[00:12:13] **Mark Petrov:** Uhum, so you have multi-agent system. There is some validator (model) and if somethinf is missing then it prompts again?

[00:12:27] **Timur Zainullin:** No, validator is not an agent, It's an algorithm. We just need to check if it forgot something. Well, we didn't have such cases. Gemma works well. [redacted].

[00:12:59] **Mark Petrov:** Nice. Is it on local host now?

[00:13:05] **Ruslan Stetsenko:** Yeah it's local host yet.

[00:13:07] **Mark Petrov:** Okay, when you will go somewhere send me I will test on some websites.

[00:13:12] **Ruslan Stetsenko:** Yes, okay. Well, that's everything I wanted to say. I guess that's it.

[00:13:27] **Mark Petrov:** Nice. Do you have any questions? complains? reccomendations?

[00:13:39] **Ruslan Stetsenko:** Kinda no.

[00:13:42] **Mark Petrov:** Have a good evening, bye.

---

**End of meeting. Duration: 13 minutes and 48 seconds.**