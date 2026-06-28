# Meeting week 4 transcript

**Date:** June 27, 2026

**Customer:** Mark Petrov

**Project delivery team:** Ruslan Stetsenko, Lenar Gabdrakhimov, Egor Oleshko

**Original language of interview:** Russian

---

[00:00:00] **Ruslan Stetsenko** Well, I started.   

[00:00:03] **Egor Oleshko** So there is link is in the chat.  

[00:00:06] **Egor Oleshko** It hasn't launched on the domain yet.  

[00:00:08] **Egor Oleshko** So we'll have to test it there.

[00:00:15] **Mark Petrov** Mhm.  

[00:00:19] **Egor Oleshko** Did you log in on website?.  

[00:00:27] **Mark Petrov** Aha.  

[00:00:30] **Mark Petrov** Is it visible?.  

[00:00:31] **Egor Oleshko** Aha.  

[00:00:33] **Egor Oleshko** And the first test is that under the condition that the site is working and the user is on the main page, and the user is either registered or has free attempts, then entering right url and clicking button scan is happening and user receives report.  

[00:00:56] **Mark Petrov** Why the results button isn't clickable.  

[00:01:04] **Ruslan Stetsenko** Because there is nothing yet.

[00:01:08] **Mark Petrov** So what? Then I need to come and there should be message that says there is not results started yet and you need to start scanning.  

[00:01:15] **Egor Oleshko** We'll take that into account..  

[00:01:19] **Mark Petrov** Why it is not clickable here? (top left corner) 

[00:01:27] **Egor Oleshko** These are leftovers from the old frontend. We currently have a new one in development. 

[00:01:35] **Mark Petrov** Will it be beautiful?

[00:01:37] **Egor Oleshko** Yes, it should be beautiful

[00:01:40] **Ruslan Stetsenko** We haven't had time to make the new frontend yet.  

[00:01:46] **Egor Oleshko** We just had a person to gone away on business, so it's going to be done today.  

[00:01:50] **Mark Petrov** But you could have vibecoded it, but okay.

[00:01:57] **Mark Petrov** Three out of three guest checks remain. 

[00:02:08] **Mark Petrov** Will it work without HTTPS?

[00:02:15] **Egor Oleshko** It should. Just enter it, and it will work.  

[00:02:41] **Mark Petrov** What's this? High risk is written, but risk score is zero.  

[00:02:44] **Egor Oleshko** Risk scoring is in process of development. But PDF should work, downloading.  

[00:02:55] **Mark Petrov** Policy.  

[00:02:56] **Egor Oleshko** And fines also should...

[00:02:59] **Mark Petrov** Why the third one is highlighted.  

[00:03:03] **Egor Oleshko** Just a sec.., where?  

[00:03:08] **Mark Petrov** Ahaha, I kissed the front-end hands.  

[00:03:13] **Mark Petrov** Here, if you hover, you see the frame is outlined in gray.  

[00:03:15] **Egor Oleshko** Yeah.  

[00:03:18] **Mark Petrov** But if I hover here, it doesn't outline, but if I scroll a little and hover, it does.  

[00:03:26] **Egor Oleshko** Yeah.  

[00:03:28] **Mark Petrov** This is genius.  

[00:03:36] **Mark Petrov** Privacy Policy is not found.  

[00:03:44] **Mark Petrov** There's no separate agreement for PD.  

[00:04:21] **Mark Petrov** Mhm. Is mc.yandex.ru not in Russia?

[00:04:29] **Ruslan Stetsenko** It shows that it is in Russia, but there are others that aren't in Russia

[00:04:45] **Lenar Gabdrakhimov** Maybe problem is in the database. We're using MaxMind, and this is the free version. So maybe this IP isn't in their database, and we're just marking it as non-Russian for now.   

[00:05:21] **Mark Petrov** Is 13 checks is all checks that needed? 

[00:05:30] **Egor Oleshko** Lenar, do you know? The thing is that Timur is the one handling that. But he is not with us today.

[00:05:40] **Lenar Gabdrakhimov** Well, I do not remember all necessary checks, that should be implemented. We need to ask clarification from Timur. But probably most of checks are implemented.

[00:05:52] **Ruslan Stetsenko** I checked a lot website. And it's usually 13 checks 

[00:06:00] **Egor Oleshko** It's the second user test: when entering a valid email and a password of at least eight characters, an account should be created.

[00:06:15] **Mark Petrov** Why is it analyzing it again? Uhm, okay  

[00:06:25] **Mark Petrov** Is there no email verification yet?  

[00:06:27] **Egor Oleshko** Yes, that's planned for the next sprint.  

[00:06:33] **Mark Petrov** Ooh, checking the gosuslugi services portal? That’s strong.

[00:06:40] **Egor Oleshko** I think someone mentioned that gosuslugi is blocking us.  

[00:06:47] **Ruslan Stetsenko** Yes, there are issues with gosuslugi. Sometimes it checks, sometimes it doesn't. When I tested it. 

[00:06:55] **Mark Petrov** Then why did you put gosuslugi as a possible test check?

[00:07:00] **Lenar Gabdrakhimov** AI did this.

[00:07:05] **Mark Petrov** So why are you vibecoding so bad? It is very useful skill.  

[00:07:10] **Egor Oleshko** We are inexperienced.

[00:07:14] **Mark Petrov** Then learn. Where are you vibecoding?  

[00:07:20] **Ruslan Stetsenko** Well, I'am personally advanced to a new level. I bought a subscription to CodeX.

[00:07:27] **Mark Petrov** Well, I can't hear you.  

[00:07:35] **Ruslan Stetsenko** I am saying, that I bought Codex subscription ChatGpt+.  

[00:07:42] **Mark Petrov** CodeX is not bad. Do you use agent skills? MCPs?

[00:07:50] **Ruslan Stetsenko** Well, I am using planning mode.  

[00:07:54] **Mark Petrov** It's sad. Read about agents, skills, and MCPs and definitely use them. It will be much better.

[00:08:04] **Ruslan Stetsenko** Okay, I'll write it down.  

[00:08:06] **Mark Petrov** If you're a programmer, use Cursor.  

[00:08:20] **Mark Petrov** Do we have max.ru?  

[00:08:24] **Egor Oleshko** Yes, I think we'he tested on it.  

[00:08:30] **Mark Petrov** Yes, it's exist.  

[00:08:35] **Ruslan Stetsenko** max.ru can be checked. I've done many tests.  

[00:08:48] **Egor Oleshko** It's almost a safe website.  

[00:09:10] **Mark Petrov** Many people are hosting on mc.yandex.ru. I think you need to do something on backend  

[00:09:22] **Egor Oleshko** Like, separate exceptions where mc.yandex.ru is considered normal?

[00:09:25] **Mark Petrov** I don't know, but it should be normal.   

[00:09:32] **Mark Petrov** Because, even if they redirect something, it's a problem with Yandex, not Max.  

[00:09:50] **Mark Petrov** Okay, what else is needed? Any questions?  

[00:09:54] **Egor Oleshko** The third user test is to check that when you're not logged in and after three attempts, it no longer allows you to start the test.  

[00:10:17] **Mark Petrov** Will it take a long time to check sberbank?.  

[00:10:36] **Egor Oleshko** One thing is missing, that website should tell user to buy product.  

[00:10:45] **Mark Petrov** Yes, you need it.  

[00:10:58] **Mark Petrov** There is no fine calculation!  

[00:11:04] **Egor Oleshko** Yes, we remember it. This function in development. 

[00:12:19] **Mark Petrov** Do you have any questions?  

[00:12:21] **Egor Oleshko** One more thing, Ruslan should show you working history, because it only work locally for some reason. 

[00:12:35] **Ruslan Stetsenko** Yes, I will show it now. 

[00:12:41] **Ruslan Stetsenko** Can you see it?

[00:12:44] **Egor Oleshko** Yes.  

[00:12:52] **Ruslan Stetsenko** Here is localhost, let me enter url, for example sberbank. Let's wait until checking is finished.

[00:13:30] **Ruslan Stetsenko** Conference is ending in 10 minutes, but we should make it in time.

[00:13:40] **Ruslan Stetsenko** So, here it is. Let's enter here

[00:13:45] **Mark Petrov** Why.he has different risk-score now?  

[00:13:48] **Egor Oleshko** Because it is placeholder for now.  

[00:13:52] **Ruslan Stetsenko** I think it's just giving random numbers.  

[00:14:00] **Ruslan Stetsenko** Here it is: history of verifications. You can download pdf-report. And all of it will be the same. And that's all. The only thing we don't have on server is history.

[00:14:28] **Egor Oleshko** So from previous feedback: new frontend is currently in development and on the next we will have email verification.

[00:14:40] **Mark Petrov** Frontend with new design?

[00:14:43] **Egor Oleshko** Yes, with new design.

[00:14:46] **Mark Petrov** Can you show it to me?

[00:14:50] **Egor Oleshko** Only Timur have it.

[00:14:48] **Mark Petrov** Then how did you get the design approved? Who is leader?

[00:15:04] **Lenar Gabdrakhimov** Well, Timur is leader of design. We trust him.

[00:15:14] **Mark Petrov** Is Timur now with us?  

[00:15:18] **Egor Oleshko** He had to leave today unfortunately.

[00:15:25] **Mark Petrov** And none of you saw the design?

[00:15:31] **Lenar Gabdrakhimov** Yes.

[00:15:35] **Ruslan Stetsenko** I doubt that it even exists.

[00:15:40] **Mark Petrov** Then vibecode it. 

[00:15:50] **Lenar Gabdrakhimov** Yes, it is his plan.

[00:15:58] **Mark Petrov** Because for B2C product it's very important. It is not a competitive product, primarily due to its design. Because if I visit a site and don't like its appearance, I will leave. So work.

[00:16:50] **Egor Oleshko** So we are planning to do email verification. Proper free and subsctiption versions of the product. And finish risk-scoring and fine calculation. Then we have quality requirements that website check should not take longer than 1 minute and user can't register invalid email.

[00:17:30] **Egor Oleshko** And also that if all services are working, then website should be also accessible. And that's all.

[00:17:44] **Mark Petrov** What services?

[00:17:46] **Egor Oleshko** Services that site uses them itself, inside.  

[00:17:53] **Mark Petrov** I got it. Okay.

[00:18:04] **Mark Petrov** Super, have a great weekend. I'm waiting design.

[00:18:14] **Egor Oleshko** Thanks, you too. There will be a design.

---

**End of meeting. Duration: 18 minutes and 15 seconds.**