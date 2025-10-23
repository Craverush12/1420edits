export const packs = [
  { id: "vol-1", title: "Desi Bass Edits Vol. 1", coverImage: "/covers/vol-1.png" },
  { id: "vol-2", title: "Desi Bass Edits Vol. 2", coverImage: "/covers/vol-2.jpg" },
  { id: "vol-3", title: "Desi Bass Edits Vol. 3", coverImage: "/covers/vol-3.jpg" },
  { id: "vol-4", title: "Desi Bass Edits Vol. 4", coverImage: "/covers/vol-4.jpg" },
  { id: "vol-5", title: "Desi Bass Edits Vol. 5", coverImage: "/covers/vol-5.png" },
] as const

// Each pack contains the actual songs from your collection
export const packSamples: Record<(typeof packs)[number]["id"], { title: string; url: string }[]> = {
  "vol-1": [
    { title: "Aao Huzoor Tumko (THE 14.20 EDIT)", url: "/14.20_s DESI BASS EDITS/Vol.1/Aao Huzoor Tumko (THE 14.20 EDIT).mp3" },
    { title: "Khatta Flow (THE 14.20 EDIT)", url: "/14.20_s DESI BASS EDITS/Vol.1/Khatta Flow (THE 14.20 EDIT).mp3" },
    { title: "Pappu Can't Dance (THE 14.20 EDIT)", url: "/14.20_s DESI BASS EDITS/Vol.1/Pappu Can_t Dance (THE 14.20 EDIT).mp3" },
  ],
  "vol-2": [
    { title: "Ainvayi Ainvayi (THE 14.20 EDIT)", url: "/14.20_s DESI BASS EDITS/Vol.2/Ainvayi Ainvayi (THE 14.20 EDIT).mp3" },
    { title: "Make Some Noise For The Desi Boyz (THE 14.20 EDIT)", url: "/14.20_s DESI BASS EDITS/Vol.2/Make Some Noise For The Desi Boyz (THE 14.20 EDIT).mp3" },
    { title: "Ramta Jogi THE 14.20 EDIT 24 bit", url: "/14.20_s DESI BASS EDITS/Vol.2/Ramta Jogi (THE 14.20 EDIT) .mp3" },
  ],
  "vol-3": [
    { title: "Apsara Aali (The 14.20 EDIT)", url: "/14.20_s DESI BASS EDITS/Vol.3/Apsara Aali (The 14.20 EDIT).mp3" },
    { title: "Ghafoor (THE 14.20 EDIT)", url: "/14.20_s DESI BASS EDITS/Vol.3/Ghafoor (THE 14.20 EDIT).mp3" },
    { title: "Ramti Aave Madi (THE 14.20 EDIT)", url: "/14.20_s DESI BASS EDITS/Vol.3/Ramti Aave Madi (THE 14.20 EDIT).mp3" },
  ],
  "vol-4": [
    { title: "Chaar Baj Gaye (THE 14.20 EDIT)", url: "/14.20_s DESI BASS EDITS/Vol.4/Chaar Baj Gaye (THE 14.20 EDIT).mp3" },
    { title: "Let's Nacho (THE 14.20 EDIT)", url: "/14.20_s DESI BASS EDITS/Vol.4/Let_s Nacho (THE 14.20 EDIT).mp3" },
    { title: "Mundian To Bach Ke (THE 14.20 EDIT)", url: "/14.20_s DESI BASS EDITS/Vol.4/Mundian To Bach Ke (THE 14.20 EDIT).mp3" },
  ],
  "vol-5": [
    { title: "Ek mai aur Ek tu (THE 14.20 EDIT)", url: "/14.20_s DESI BASS EDITS/Vol.5/Ek mai aur Ek tu (THE 14.20 EDIT).mp3" },
    { title: "Gal Mitthi Mitthi (THE 14.20 EDIT)", url: "/14.20_s DESI BASS EDITS/Vol.5/Gal Mitthi Mitthi (THE 14.20 EDIT).mp3" },
    { title: "Make Some Noise For The Desi Boyz (THE 14.20 EDIT 2)", url: "/14.20_s DESI BASS EDITS/Vol.5/Make Some Noise For The Desi Boyz (THE 14.20 EDIT 2).mp3" },
  ],
}
