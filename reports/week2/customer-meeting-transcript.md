# Meeting week 2 Transcript

**Date:** June 13, 2026

**Customer:** Mark Petrov

**Product delivery team:** Egor Oleshko, Ruslan Stetsenko, Timur Zainullin

**Original language of interview:** Russian

---

[00:00:03] **Ruslan Stetsenko:** I have started recording

[00:00:05] **Egor Oleshko:** As for beginning, we need written consent for MIT license use from you. You can provide it as an email or a telegram message.

[00:00:21] **Mark Petrov:** Yeah okay, I will write it on telegram.

[00:00:23] **Ruslan Stetsenko:** Yeah, just write it on telegram... this... message.

[00:00:38] **Egor Oleshko:** And we also need your approval for user stories. So, can I read them or demonstrate? What is more convenient?

[00:00:53] **Mark Petrov:** Well, read it.

[00:00:58] **Egor Oleshko:** [Reads user story]. This requirement is must have.

[00:01:15] **Mark Petrov:** I agree. Just read everything and I will say if disagree.

[00:01:22] **Egor Oleshko:** [inaudible]

[00:01:24] **Egor Oleshko:** [Continues reading user stories]

[00:01:48] **Mark Petrov:** Stop here [on user story 3]. Is AI really needed here? Yeah it's needed for some part, but for cyber security [redacted]... well read that again.

[00:02:08] **Egor Oleshko:** [Reads user story again]

[00:02:18] **Egor Oleshko:** It means we check law compliance using AI. That is, not order from a human, but ask from our service that uses AI. But counting will be without AI, as we think.

[00:02:35] **Ruslan Stetsenko:** AI is for privacy policy check.

[00:02:39] **Egor Oleshko:** It's for user got quick response.

[00:02:46] **Mark Petrov:** Okay.

[00:02:48] **Egor Oleshko:** [Continues reading user stories]

[00:03:15] **Mark Petrov:** Why you put checks history and penalty sum in one place? [Connection issues]

[00:04:00] **Mark Petrov:** Can you hear me now? [repeats the question]. Penalty sum is separate on each check.

[00:04:18] **Egor Oleshko:** Yeah I also thought about that. If we omit penalty sum, will checks history in one place be enough as for requirement?

[00:04:33] **Mark Petrov:** How can you watch check history in different places?

[00:04:36] **Egor Oleshko:** [Laughs] In general, we need check history.

[00:04:39] **Mark Petrov:** That's already better.

[00:04:42] **Ruslan Stetsenko:** As I understand... Can I say? As I understand we'll have there check history and for each website there will be penalty sum for each violation. So, for some website there can be several violations and sum of those violations is written for that website.

[00:05:05] **Mark Petrov:** At each check separate penalty sum...

[00:05:09] **Ruslan Stetsenko:** Yeah... [Laughs]

[00:05:15] **Egor Oleshko:** [Laughs]

[00:05:18] **Mark Petrov:** Egor, explain that to your colleague.

[00:05:23] **Egor Oleshko:** In fact, penalty sum will be like that written in each report. So, in checks history will be checks themselves and inside penalty sum for each according to requirements.

[00:05:35] **Ruslan Stetsenko:** Well, okay, I understand.

[00:05:39] **Mark Petrov:** Nice, let us continue.

[00:05:46] **Egor Oleshko:** [Continues reading user stories]

[00:06:11] **Mark Petrov:** [Agrees with Egor]

[00:06:55] **Mark Petrov:** I don't really understand the question.

[00:07:00] **Egor Oleshko:** Can lawyer speed up their work by our service?

[00:07:24] **Mark Petrov:** No, I think no. [inaudible] We are giving full report.

[00:07:33] **Egor Oleshko:** About admin panel. We won't have it as you said at the meeting?

[00:07:40] **Mark Petrov:** Yeah it won't be.

[00:07:43] **Egor Oleshko:** On requirements that's it.

[00:07:47] **Mark Petrov:** So what's now?

[00:07:52] **Egor Oleshko:** So, now... now I wanted to say that we determined AI to use. Timur, what is the name?

[00:08:03] **Timur Zainullin:** [Laughing] Google Gemma 4.

[00:08:05] **Egor Oleshko:** Here. And he said that it will cost about 6 rubles per request.

[00:08:11] **Mark Petrov:** Uhm... Per one website check?

[00:08:16] **Egor Oleshko:** Yes.

[00:08:17] **Mark Petrov:** Overall, it's okay. Gemini 4 or which?

[00:08:23] **Timur Zainullin:** Google Gemma Gemma.

[00:08:26] **Mark Petrov:** Gemma? Or Gemini?

[00:08:31] **Timur Zainullin:** No, not Gemini.

[00:08:33] **Mark Petrov:** Gemma? It is small.

[00:08:40] **Timur Zainullin:** It's quite good [inaudible].

[00:08:42] **Mark Petrov:** Could you share your testing?

[00:08:53] **Timur Zainullin:** [inaudible]

[00:08:56] **Mark Petrov:** Okay let's continue.

[00:09:00] **Egor Oleshko:** I will show you frontend prototype. How it approximately looks like. Let me turn on demonstration. Can you see?

[00:09:20] **Mark Petrov:** Yeah I can.

[00:09:22] **Egor Oleshko:** [Shows prototype]

[00:10:19] **Mark Petrov:** Why personal account is in checks history? And balance also in history.

[00:10:26] **Egor Oleshko:** Yeah balance should be in personal account tab and we'll move profile.

[00:10:40] **Mark Petrov:** It's logical to put into profile two branches: one for balance and count of checks, another for checks history.

[00:10:50] **Egor Oleshko:** Okay, so history is also in profile?

[00:10:51] **Mark Petrov:** Yes, right.

[00:10:56] **Mark Petrov:** [Does not understand why results are in separate header]

[00:11:40] **Egor Oleshko:** [Demonstrates the work of check]

[00:11:52] **Mark Petrov:** So there will be stored results of last check? Then it's okay.

[00:12:20] **Egor Oleshko:** [Shows what team is going to do for MVP 0]

[00:12:39] **Mark Petrov:** Sounds adequately.

[00:12:45] **Egor Oleshko:** Then, that's it.

[00:12:50] **Mark Petrov:** Any questions?

[00:13:10] **End of meeting**