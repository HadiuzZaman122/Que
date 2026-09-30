/**
 * ==========================================================================
 * OUR STORY — RELATIONSHIP MEMORY VAULT DATA SOURCE
 * ==========================================================================
 * To add new memories to your permanent gallery:
 * 1. Place your photo(s) into: assets/memories/
 * 2. Add a new object to this array below:
 *    {
 *        date: "10 March 2026",
 *        title: "Another Special Day",
 *        description: "A beautiful memory together.",
 *        photos: [
 *            "assets/memories/day1.jpg",
 *            "assets/memories/day2.jpg",
 *            "assets/memories/day3.jpg"
 *        ]
 *    },
 * 3. Save this file — the website automatically renders the new memory card!
 * ==========================================================================
 */

const memories = [
  {
    date: "~ 5th March'26 ~",
    title: "The Day of Our Journey",
    description: "When you first texted me, I was honestly scared to reply. I was embarrassed, nervous, and confused about what I was feeling. A part of me wanted to reply immediately, while another part was afraid of what might happen if I opened that door again. But I couldn't ignore how I felt when I saw your name on my screen. Maybe that little moment was the beginning of something I didn't know I was still waiting for.",
  },
  {
    date: "~ 25th March'26 ~",
    title: "The Day When It all Began!",
    description: "And then, after almost 20 days of silence, you texted me again. I still remember seeing your message and thinking, ‘Wait… she texted me again?’ 😭 I didn't expect it at all. After that one day of talking, I thought maybe that was it and we would just go back to being strangers again. But somehow, you came back. And that little message started a conversation that slowly became something much more than either of us expected.",
  },
  {
    date: "~ 4Th April'26 ~",
    title: "The Proposal",
    description: "When you proposed to me, I honestly didn’t know what to do. I was completely confused, nervous, and overwhelmed all at once. I had so many thoughts running through my mind that I couldn’t even figure out what to say first. A part of me was smiling, another part was scared, and somewhere deep down, I was wondering if this was really happening to us again. After everything we had been through, I never imagined that I would be standing at that moment, with you choosing me again. I didn’t have the perfect words or the perfect reaction, but I knew that what I was feeling was real. ❤️",
  },
  {
    date: "~ 6Th April'26 ~",
    title: "~ The First Call ~",
    description: "Looking at you and knowing with absolute certainty that you are my favorite part of every day and my whole heart.",
    photos: [
      "assets/memories/fc1.jpeg",
      "assets/memories/fc2.jpeg"
    ]
  },
  {
    date: "~ 27Th June'26 ~",
    title: "~ The First MEET ~",
    description: "The moment I finally saw you for the first time, it felt a little unreal. After all the conversations, memories, and years between us, there you were, standing right in front of me. You looked so elegant that for a moment, I honestly forgot what I was supposed to say. I had imagined that moment so many times, but seeing you in person was completely different. I was nervous, a little shy, and honestly just trying to take in the fact that the person I had missed for so long was finally right there in front of me. ",
    photos: [
      "assets/memories/fm1.jpeg",
      "assets/memories/fm2.jpeg",
      "assets/memories/fm3.jpeg",
      "assets/memories/fm4.jpeg",
      "assets/memories/fm5.jpeg",
      "assets/memories/fm6.jpeg",
      "assets/memories/fm7.jpeg",
      "assets/memories/fm8.jpeg",
      "assets/memories/fm9.jpeg",
      "assets/memories/fm10.jpeg",
      "assets/memories/fm11.jpeg"

    ]
  }
];

// Export for module systems and global browser window
if (typeof module !== "undefined" && module.exports) {
  module.exports = memories;
}
if (typeof window !== "undefined") {
  window.memories = memories;
}
