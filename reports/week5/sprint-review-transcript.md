# Week 5 Sprint Review Transcript

**Date:** July 4, 2026

**Customer:** Mark Petrov

**Project delivery team:** Ruslan Stetsenko, Lenar Gabdrakhimov, Egor Oleshko, Timur Zainullin, Dinislam Baizigitov,

**Original language of interview:** Russian

---

[00:00:03] **Ruslan Stetsenko** Okay, good.  

[00:00:05] **Egor Oleshko** He(Ruslan) will turn on the demonstration.  

[00:00:07] **Ruslan Stetsenko** I'll turn on the demonstration now and will show it locally 

[00:00:13] **Egor Oleshko** We will show the email verification and the new backend. Tell us how you like it, what needs to be fixed.  

[00:00:23] **Ruslan Stetsenko** Okay, now... I didn't exit. Hmm? Share. So, here is the new frontend. Basically, this is how the site looks.  

[00:00:41] **Mark Petrov** What is this?  

[00:00:53] **Ruslan Stetsenko** Compliance checker. Just like that. Now I can show how the registration process works. It goes like this. For now, it only works locally, but let's say like this. I enter my email. Some password here. Okay, email sent. I go here. So, it arrived in the mail. And we follow the link. One second. It's loading now.  

[00:01:53] **Egor Oleshko** You need to refresh the page.  

[00:01:56] **Ruslan Stetsenko** Ah, refreshed. Why? Oh, there, it loaded. So, I logged into my account. Like this. What else to show? Well, here is the check. Results as well. Well, the last result is shown here. There is a personal account. Personal account, check history, where you can download a PDF report. Then, well, a few more functions. Account deletion is also there. In the future, there will be purchase history, subscription.  

[00:02:47] **Mark Petrov** What do you mean account deletion? Log out of the account?  

[00:02:50] **Ruslan Stetsenko** No, exactly delete the account completely.  

[00:02:54] **Mark Petrov** Why?  

[00:02:55] **Ruslan Stetsenko** Well, just so that such a function exists. A small function.  

[00:02:59] **Mark Petrov** So what is the point of the function?  

[00:03:03] **Ruslan Stetsenko** Well, to completely erase the account so it's not in the database.  

[00:03:07] **Mark Petrov** Why? Why do something that isn't needed?  

[00:03:16] **Ruslan Stetsenko** Well, okay, maybe we'll remove this function in that case.  

[00:03:20] **Egor Oleshko** We need to delete the delete function.  

[00:03:23] **Ruslan Stetsenko** Okay, like this. Also in results, this is how the results page looks. Well, let's say, for example, the site max.ru. So, here is the frontend. Well, basically that's it. Can I turn it off, right?  

[00:03:50] **Egor Oleshko** Well, penalty calculation is currently in the implementation process this week.  

[00:03:53] **Ruslan Stetsenko** Yes, yes, penalty calculation...(interrupted) 

[00:03:55] **Egor Oleshko** This is the placeholder.  

[00:03:57] **Ruslan Stetsenko** Yes, yes, yes. Like this.  

[00:04:04] **Mark Petrov** Who is the team leader?  

[00:04:07] **Ruslan Stetsenko** Egor.  

[00:04:08] **Egor Oleshko** Well, that turns out to be me.  

[00:04:10] **Mark Petrov** Egor, have you accepted the new design?  

[00:04:15] **Egor Oleshko** Well, I'm just not a designer, I don't know. The previous one seemed normal to me, and this one... It's hard for me to judge. I don't know, somehow it looks convenient to me, although it wouldn't hurt to add either a picture or a small gradient so it's not completely black, in my opinion.  

[00:04:35] **Mark Petrov** Well, let's look at website designs. Who is turning on the demonstration now? Well, who has it on now?

[00:04:43] **Egor Oleshko** Ruslan.  Ruslan has it on now.

[00:04:45] **Ruslan Stetsenko** I have it, I have it.

[00:04:46] **Mark Petrov** Ruslan. Enter in the browser "dark landings". 
 
[00:04:52] **Ruslan Stetsenko** Dark vendings?  

[00:04:55] **Mark Petrov** L-L. Landings.  

[00:04:56] **Egor Oleshko** Landings.  

[00:05:03] **Mark Petrov** Okay. Well, even if we switch from light to dark, for example. Page. Page. Well, dark SaaS landing page. 

[00:05:20] **Ruslan Stetsenko** Do I need to open this?

[00:05:22] **Mark Petrov** No, this is in Claude. No, this is just Claude. Most likely design, back.  

[00:05:31] **Ruslan Stetsenko** Okay, well, what to choose?  

[00:05:33] **Mark Petrov** Well, scroll down. We need a site that will have several examples of other dark sites.  

[00:05:42] **Ruslan Stetsenko** Oh, let's say this one.  

[00:05:45] **Mark Petrov** Here, 84 Dark Mode SaaS Landing Pages.  

[00:05:49] **Ruslan Stetsenko** Yes.  

[00:05:53] **Mark Petrov** Well, look, overview, right? There are some fonts, button highlights, then some infographics. What's on the first, what's on the second, you can scroll down a bit. Here are some more things designed, companies that use them, a quote. Over there on the top left, a preview, and more infographics. And now go back to what you have... What is this black box? Well, do you see the difference? If not, I'll try to explain.  

[00:06:36] **Ruslan Stetsenko** Well, indeed, yes, there is a difference. But here...  

[00:06:44] **Mark Petrov** That is, dark landings, they are usually not cluttered, well, SaaS in general. They are minimalistic, but at the same time they somehow reveal the product, sell. If there is literally one button, then it means one big button in the middle, right? And all attention should be focused on this button, for example. Or another one, for example, where Sign Up is. Unicorn Studio. Well, I don't know, if it's one button, all attention is focused on it, it immediately catches the eye. Back to you.  

[00:07:21] **Ruslan Stetsenko** Well, yes, here...  

[00:07:23] **Mark Petrov** On the left, then in the center, top right is just empty. Then either make the background with some kind of gradient, or maybe very dim stars, it will look cool, or something else, some widgets. Did you use AI when making the design?  

[00:07:45] **Timur Zainullin** I made this design. Let me explain everything. This design was later redone, a lot of things disappeared. But I chose such a minimalistic thing so that later it would be easier to fix or improve something. According to our plan, on the right side of this part of the page there should be a photo, an example of the result, which will be shown. Like, we should have a photo, below us there should be lists of these IP addresses that need to be added to the whitelist. Then in our results, we will also have these photos everywhere, of sites, for example, elements of sites. We, of course, improved the brightness of colors, there they are a bit... how to say... invisible. But we chose this design for now because with this design it will be easier for you to improve it later and bring it to a more normal look.  

[00:08:59] **Mark Petrov** And why couldn't you make it normal right away?  

[00:09:03] **Timur Zainullin** Well, we don't have enough power. We can't... well, we haven't managed yet, simply put.  

[00:09:12] **Mark Petrov** What do you mean not enough power? This is done with one prompt. I've probably been telling you for the third or fourth season how to make an adequate design. Has anyone tried to do it through AI and some agent like Kombai?  

[00:09:29] **Timur Zainullin** Yes, yes, I tried.  

[00:09:31] **Mark Petrov** What was the result?  

[00:09:32] **Timur Zainullin** I wrote... well, it tells me "free attempts finished". And then... well, like, it was already... I couldn't make a normal site. As a result, then every time... I paid, it didn't like it afterwards. It always turned out much worse than this design was.(Pause) You have to pay money, quite a lot. (Pause) Therefore... but we will still improve this, make the design better. This is not the final version. Now our focus is on finishing this functionality, and then we will finish the frontend.  

[00:10:18] **Mark Petrov** And why can't everything be done in parallel? How many people are in your team, five, six?  

[00:10:22] **Ruslan Stetsenko** Five.  

[00:10:23] **Egor Oleshko** Five.  

[00:10:25] **Mark Petrov** Well, who is responsible for what?  

[00:10:31] **Egor Oleshko** I'm basically responsible for documentation and reports.  

[00:10:35] **Mark Petrov** Mhm. Next?  

[00:10:41] **Ruslan Stetsenko** Well, I generally helped make this frontend. Well, like, so that it works, so that all buttons are pressed, so that everything works, is displayed.  

[00:10:52] **Mark Petrov** Mhm. What is Lenar responsible for?  

[00:10:56] **Lenar Gabdrakhimov** Well, before that I did some backend services, and now... well, now I made account deletion from the issue, and that's all for now.  

[00:11:11] **Mark Petrov** Mhm. What is Timur responsible for?  

[00:11:14] **Timur Zainullin** I made the worker.  

[00:11:17] **Mark Petrov** So why did you get into design then?  

[00:11:21] **Timur Zainullin** Because they couldn't cope.  

[00:11:24] **Mark Petrov** Are you covering for everyone?  

[00:11:27] **Timur Zainullin** Well, we are a team.  

[00:11:31] **Ruslan Stetsenko** He showed initiative, and we agreed.  

[00:11:34] **Mark Petrov** Ah. How great you are. And what does Dinislam do?  

[00:11:39] **Dinislam Baizigitov** Backend.  

[00:11:43] **Mark Petrov** Ah, backend. Well, that's at least a clear, understandable role. Not that... Motion Doc. Ruslan apparently, right?  

[00:11:54] **Ruslan Stetsenko** Yes.  

[00:11:57] **Mark Petrov** I appoint you responsible for the design. It should be normal. It's not difficult to do. Now nothing has changed, it just became black instead of white and shifted slightly. Ah, well, an adequate footer appeared, but why is there so much stuff in the footer? Look at references of other dark sites if you want to make a dark one. Open this project in some Cursor so it immediately sees what endpoints are attached and you don't have to re-attach the prompt later. And based on the current buttons, all this, make a beautiful design with some infographic or something else. Well, at least somehow make it pleasing to the eye. Because I come in, I fall into... well, this black box just. Small fonts, nothing is visible. Color palette is unclear. Black and white, blue and green appear for some reason, which don't match. Find a color palette for a black site. Well, let's do it right now. Go to the browser. Palette on dark blue. Palette with dark blue. Color palette with dark blue.  

[00:13:19] **Ruslan Stetsenko** Okay, well, colors. Good.  

[00:13:22] **Mark Petrov** Well, there, even like that, for example. Already ready assembled palettes with color codes. And there... Bring back previous the colors, it was better before.  

[00:13:37] **Ruslan Stetsenko** Ah, okay. Like this?  

[00:13:45] **Mark Petrov** Here, for example, let's take Blueberry. Right? There is black, dark blue, and these colors, and they already match each other. That is, if you overlay any of them as text on this dark blue, for example, light blue, the rightmost one overlaid on the second from the left. It looks good, interesting. You can play with it a bit darker. That is, no need to reinvent the wheel, it's already there. Just find a cool color palette and use these colors. It will look cool. Really good. And then add some more visuals there. Even if later there will be some report, why not attach it now? Just generate an example of such a report in AI and insert it there. To see, maybe it will look bad, need to change it. And why plan for subsequent iterations if you can do everything now? It's more logical to do everything now. So Ruslan...  

[00:14:50] **Ruslan Stetsenko** Okay, I understood. I will try.  

[00:14:54] **Mark Petrov** If there are questions, ask. By the way, pink on blue looks cool. There are a lot of variations of everything possible. Not necessarily blue, it just came to my mind first. There is a ton of stuff. For example Kaspersky have main green color. And in general, Cybersecurity is such a dark green, Matrix colors. So look yourselves. Well, there are tons of options. What is now... well, I wouldn't go use the service. I get in, it's all black, like... well, not a SaaS, not a product, but some student project. Well, really don't want to use it.  

[00:15:43] **Ruslan Stetsenko** Understood, clear. Okay then, can I turn it off? We will move on according to the plan.  

[00:15:53] **Timur Zainullin** I have a question about the worker. I want to propose additional functionality. You know, when the results come in, it's all in text format, right? And I thought it would be good if we also showed a photo. I just did this in test format. What it shows, for example, it says that you have only one button in this cookie banner. Also to send a photo of this cookie banner. Attach, that is.  

[00:16:38] **Mark Petrov** That is, attach photos of the specific place where it is missing to the report?  

[00:16:42] **Timur Zainullin** Yes, yes. And also a photo of the image itself, the site. Right in the center.  

[00:16:50] **Mark Petrov** I like it. I like it, but the question is implementation, how beautiful it will look. And user-friendly. The value is there, yes, so that people can find and understand where it is faster, that's cool. But have you done this already?  

[00:17:16] **Timur Zainullin** Yes, yes, I did.  

[00:17:18] **Mark Petrov** Will you show a demonstration or throw a screen in the chat here, what you made?  

[00:17:57] **Timur Zainullin** Seems like files cannot be sent.  

[00:17:59] **Mark Petrov** Hm?  

[00:18:00] **Timur Zainullin** Seems like files cannot be sent.  

[00:18:03] **Mark Petrov** Where?  

[00:18:05] **Timur Zainullin** To the chat.  

[00:18:06] **Mark Petrov** Send it to me in private or in the group.  

[00:18:13] **Ruslan Stetsenko** I can resend it in Telegram.  

[00:18:17] **Timur Zainullin** But I need to exit Zoom in order to enter Telegram.  

[00:18:27] **Mark Petrov** Well, turn on the demo then, don't exit, turn on the demo, I'll look through you.  

[00:18:31] **Timur Zainullin** Okay, let's. Share. Is everything visible?  

[00:18:52] **Mark Petrov** Yes, yes, it's visible.  

[00:18:55] **Timur Zainullin** Here. Here is the image itself. Visible?  

[00:19:00] **Egor Oleshko** Yes. It is innopolis website

[00:19:05] **Timur Zainullin** Yes, yes, here. And now it finds, builds the path, artificial intelligence, and shows this. And the correspondence there. Here, only one button "Agree" or "No".

[00:19:20] **Mark Petrov** Mhm. It's okay. I think it can be inserted, yes. Sounds good.

[00:19:40] **Ruslan Stetsenko** Egor, did you have something else?

[00:19:41] **Egor Oleshko** Well we need to discuss. Next week do we need to focus on this new functionality or finally create the frontend.

[00:19:53] **Mark Petrov** Not frontend, design.  

[00:19:56] **Egor Oleshko** Well, design.  

[00:19:57] **Mark Petrov** Your frontend is normal. You most likely have connections to the backend, everything is fine there. But you are doing double work for some reason. Then you will still have to re-bind it, deal with all this nonsense. Do it properly right away to make life easier for yourselves later. Well, that's okay. In short, yes, I'm waiting for the design. Ruslan is responsible for the design.  

[00:20:32] **Ruslan Stetsenko** Yes, let's say yes.  

[00:20:34] **Mark Petrov** Not "let's say". You are responsible. So, read articles about UX/UI. A couple literally, it will be enough for you. And look at other references. You will understand how to package the product. And that's it. It's done very simply. The most important thing in design is just to see a lot of designs. That is, basic knowledge may or may not be there, but to make something adequate, you just need to see other examples. Most likely due to the fact that you haven't seen much SaaS, you have little exposure, so you don't understand how it can be done. So look at other products, how other guys do it, and make something similar. And that's it. No need to do something super new, incredible. Just adequate, classic by modern standards. That's it. And write to me about the design and all this, I will answer you. And don't be afraid to ask questions.  

[00:21:47] **Ruslan Stetsenko** Okay.  

[00:21:49] **Mark Petrov** I'm not biting today. Well, it's normal that you don't know everything. That's good, because you are learning. Learn productively, ask questions. I generally love well-formulated question. Questions?  

[00:22:19] **Egor Oleshko** No questions.  

[00:22:22] **Mark Petrov** Okay.  

[00:22:26] **Egor Oleshko** Well, I think that's about it.  

[00:22:30] **Mark Petrov** Good. Do you need anything else regarding your assignment?  

[00:22:38] **Egor Oleshko** Ah, there we need this User Acceptance Test, that this PDF report functionality works and that the mail is actually confirmed.  

[00:22:50] **Mark Petrov** And how is this checked?  

[00:22:54] **Egor Oleshko** Well, theoretically you should say that the result of the User Acceptance Test is like this.  

[00:23:04] **Mark Petrov** Everything is good.  

[00:23:07] **Egor Oleshko** Okay.  

[00:23:12] **Mark Petrov** That's all for today? Well then, have a good weekend everyone, Ruslan a productive design weekend. Good bye.  

[00:23:20] **Ruslan Stetsenko** Good, goodbye. Have a good weekend.  

[00:23:23] **Egor Oleshko** Goodbye.
---

**End of meeting. Duration: 23 minutes and 25 seconds.**
