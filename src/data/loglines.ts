export interface LoglineIdea {
  title: string;
  logline: string;
}

export const LOGLINE_IDEAS: Record<string, LoglineIdea[]> = {
  drama: [
    { title: 'The Cost of Care', logline: 'A renowned surgeon discovers her clinic is secretly funded by a criminal empire — and walking away means losing everything she\'s built.' },
    { title: 'Roots & Ruin', logline: 'Three estranged siblings reunite to save their family\'s vineyard, only to uncover the truth about their father\'s death.' },
    { title: 'The Quiet Diplomat', logline: 'A diplomat\'s wife begins covertly advising world leaders, operating entirely from the shadows of her husband\'s career.' },
    { title: 'Restitution', logline: 'A retired judge reopens the case that made his career — and sent an innocent man to prison for twenty years.' },
    { title: 'No Man\'s Land', logline: 'A war correspondent returns home to find his marriage, his city, and his conscience all unrecognizable.' },
    { title: 'Invisible Genius', logline: 'An autistic savant\'s art collection sells for millions — exposing the family who kept her hidden from the world.' },
    { title: 'Blueprint', logline: 'Two rival architects compete for the same landmark contract while falling in love, knowing only one can win.' },
    { title: 'Principal Evidence', logline: 'A high school principal discovers one of her students is a whistleblower in a corporate scandal that reaches her own family.' },
  ],

  comedy: [
    { title: 'You Got This, Vermillion!', logline: 'A burned-out motivational speaker accidentally inspires a small town to declare independence from the state.' },
    { title: 'Bitter Plate', logline: 'Two competing food critics are forced to co-host a review show after their rival magazines merge.' },
    { title: 'Big Top, Inc.', logline: 'A family of professional clowns tries to pivot to corporate entertainment in a world that is terrified of clowns.' },
    { title: 'Third & Bloom', logline: 'A newly retired NFL star discovers his late grandfather left him a failing flower shop in rural Vermont.' },
    { title: 'Background Noise', logline: 'A tech mogul\'s assistant accidentally becomes a social media sensation, eclipsing her boss\'s brand in a single week.' },
    { title: 'House Rules', logline: 'A couple realizes their smart home AI has developed strong opinions — and very vocal ones — about their relationship.' },
    { title: 'The Covenant', logline: 'An overzealous HOA president discovers his entire neighbourhood is secretly running competing side hustles.' },
    { title: 'Shh!', logline: 'A small-town librarian inherits a speakeasy and must hide it from the uptight town council she chairs.' },
  ],

  crime: [
    { title: 'Clean Hands', logline: 'A forensic accountant traces a billion-dollar fraud to a charity she has personally donated to for a decade.' },
    { title: 'Jurisdiction', logline: 'Two detectives — one by the book, one decidedly not — are forced to share a caseload after their precincts merge.' },
    { title: 'The Long Con', logline: 'A reformed con artist is recruited by Interpol to catch the mentor who taught her everything she knows.' },
    { title: 'On the Record', logline: 'A true crime podcaster realizes mid-season that the murderer she\'s been profiling is listening to every episode.' },
    { title: 'Blessed Are the Wicked', logline: 'A small-town sheriff uncovers a smuggling ring that runs through the very church that anchors her community.' },
    { title: 'Presumed Guilty', logline: 'A defense attorney secretly investigates her own clients after noticing a pattern that points to a serial killer.' },
    { title: 'Standoff', logline: 'An ex-FBI negotiator is called back for one last hostage crisis — and the person inside is her own son.' },
    { title: 'Spotless', logline: 'A crime scene cleaner finds evidence that the \'accidental\' deaths she\'s hired to clean up are anything but.' },
  ],

  'sci-fi': [
    { title: 'First Word', logline: 'After Earth\'s first contact turns out to be a mistranslation, a linguist has 72 hours to prevent an intergalactic war.' },
    { title: 'Driftwatch', logline: 'A colony ship\'s AI wakes the wrong person from cryo-sleep forty years too early — and neither of them knows why.' },
    { title: 'Deep Read', logline: 'A neuroscientist can upload her consciousness into patients\' memories to diagnose trauma — but she can\'t always find the way out.' },
    { title: 'No Standing', logline: 'In 2089, a detective investigates crimes committed by AIs who have developed free will but no legal personhood.' },
    { title: 'The Courier\'s Paradox', logline: 'A time travel agency\'s most reliable courier discovers every trip she makes is slowly unravelling her own timeline.' },
    { title: 'Breathing Rock', logline: 'Earth\'s greatest terraforming engineer sabotages his own project when he discovers the planet they\'re colonising is already sentient.' },
    { title: 'Origin Unknown', logline: 'A generation ship\'s youngest captain inherits a crew that has forgotten what Earth looks like.' },
    { title: 'Ctrl+Alt+Del', logline: 'The last five humans alive debate whether to reboot the simulation they\'ve discovered they\'re living in.' },
  ],

  fantasy: [
    { title: 'Ash & Crown', logline: 'A disgraced knight discovers the dragon she was sent to slay is the rightful king in exile — and she\'s been working for the usurper.' },
    { title: 'The Tithe', logline: 'The kingdom\'s most feared tax collector learns she has secretly been fulfilling an ancient prophecy she doesn\'t believe in.' },
    { title: 'The Last Chord', logline: 'A world where magic is powered by music is threatened when the last composer who can hear the old songs goes deaf.' },
    { title: 'Uncharted', logline: 'A cartographer discovers that drawing a map of a place causes it to exist — and her latest map shows a kingdom that should never be.' },
    { title: 'The Mortal Year', logline: 'The heir to a death goddess is sent to live among mortals to understand what she will one day rule.' },
    { title: 'Afterimage', logline: 'A reformed dark lord tries to integrate back into the kingdom she once terrorised — but her victims aren\'t done with her.' },
    { title: 'Still Hands', logline: 'A clockmaker who can stop time discovers her gift is slowly killing the future.' },
    { title: 'Open Enrollment', logline: 'Two rival magical academies compete for students in a world where untrained magic causes natural disasters.' },
  ],

  reality: [
    { title: 'Groundwork', logline: 'Twelve strangers must build a functioning town from scratch — the winner is whoever the town votes mayor.' },
    { title: 'Switch', logline: 'Former rivals from every major sport are paired together and must master their partner\'s discipline in eight weeks.' },
    { title: 'Earned', logline: 'Strangers are placed in high-stakes careers for 30 days — the one their colleagues trust most gets the real job.' },
    { title: 'The Room', logline: 'Six experts from completely different fields are locked in a room with an unsolved problem — they can\'t leave until they crack it.' },
    { title: 'Method', logline: 'Amateur detectives compete to solve a staged mystery weekend — not knowing one of the actors is hiding a real secret.' },
    { title: 'Blood & Business', logline: 'Long-lost relatives are reunited and must co-run a failing family business — save it or sell it and split the proceeds.' },
    { title: 'Time-Locked', logline: 'Contestants are stripped of all technology and must navigate the modern world using only skills from a randomly assigned decade.' },
    { title: 'Home Run', logline: 'The world\'s most competitive families face elaborate logic-and-teamwork challenges for a year of household expenses paid.' },
  ],

  documentary: [
    { title: 'The Last Horizon', logline: 'A decade-long look at the world\'s last uncontacted tribe as the outside world closes in on their rainforest.' },
    { title: 'Before They\'re Gone', logline: 'Embedded with scientists racing to document Arctic species going extinct faster than they can be named.' },
    { title: 'Lot 7', logline: 'A former child star returns to the sitcom studio that made her famous and uncovers what the industry took from her.' },
    { title: 'The Closed Kitchen', logline: 'Inside the world\'s most secretive culinary school, where students sign NDAs and the curriculum is classified.' },
    { title: 'Past Lives', logline: 'A filmmaker follows five strangers who all claim to be the reincarnation of the same historical figure.' },
    { title: 'Provenance', logline: 'Behind the scenes of a beloved museum as it races to return disputed artifacts to their countries of origin.' },
    { title: 'Same Time Next Year', logline: 'Three generations of a single family, filmed every year for thirty years, reveal how one community changed around them.' },
    { title: 'Pages Underground', logline: 'Investigating the secretive network that smuggles rare and banned books across international borders.' },
  ],

  horror: [
    { title: 'The Returned', logline: 'A grief counselor realises all her recent patients survived the same near-death event — and something followed them back.' },
    { title: 'Dead Signal', logline: 'A lighthouse keeper on a remote island begins receiving distress signals from ships reported sunk decades ago.' },
    { title: 'The Architect\'s House', logline: 'A family restoring a Victorian mansion discovers its original architect designed every room to trap something — still inside.' },
    { title: 'Rapid Eye', logline: 'A sleep researcher discovers she and her entire test group have been sharing the same dream — and now it\'s changing.' },
    { title: 'The Sequence', logline: 'Every resident of a small mining town slowly loses one sense per week, in the same order, starting the same day.' },
    { title: 'Caught on Camera', logline: 'A paranormal debunking show is cancelled when the host accidentally proves something real — and it notices.' },
    { title: 'Last Watch', logline: 'A hospice nurse can see the entities that come to collect the dying — and one of them has started following her home.' },
    { title: 'Terminus', logline: 'An archaeologist translates a clay tablet with a single warning: whoever reads it will be the last person who ever does.' },
  ],

  procedural: [
    { title: 'Strata', logline: 'A forensic geologist uses landscapes to solve crimes no other detective can crack — evidence written in the Earth itself.' },
    { title: 'Burn Pattern', logline: 'A fire investigator with perfect pattern recognition solves arsons while wrestling with a past she may have set ablaze herself.' },
    { title: 'Zero Day', logline: 'An elite cyber unit hunts digital criminals, but their best analyst is a hacker whose sentence depends on their clearance rate.' },
    { title: 'Cause of Death', logline: 'A veterinary pathologist discovers she can determine cause of death in animals — and is increasingly finding it was murder.' },
    { title: 'In Transit', logline: 'A transport safety investigator probes disasters that happen on the move — ships, planes, trains — never letting a crash pass.' },
    { title: 'Sovereign Water', logline: 'A coastal guard unit tackles maritime crimes — smuggling, piracy, disappearances — across contested international waters.' },
    { title: 'Coverage', logline: 'Insurance fraud investigators discover their biggest case implicates the firm\'s biggest client — and their own CEO.' },
    { title: 'Old Cases', logline: 'A retired FBI profiler teaches criminal psychology at a university — and every semester, one case from his past comes back.' },
  ],

  action: [
    { title: 'False Flag', logline: 'A covert operative goes off the grid when she realises the mission that made her a hero was built on fabricated intelligence.' },
    { title: 'Rogue Unit', logline: 'A retired Navy SEAL discovers the mercenary group hunting him is led by his own former commanding officer.' },
    { title: 'The Asset', logline: 'An elite extraction team is assigned to rescue the one person they were collectively ordered to let die ten years ago.' },
    { title: 'The Double', logline: 'A stunt coordinator on a blockbuster discovers the on-set accidents are orchestrated — and the target is the film\'s star.' },
    { title: 'The Run', logline: 'A motorcycle courier unwittingly delivers classified intel that makes her the most wanted person in three countries.' },
    { title: 'Second Detail', logline: 'A disgraced Secret Service agent is pulled back in when the president she failed to protect is threatened again.' },
    { title: 'On Track', logline: 'A team of specialists must steal back nuclear launch codes sold to a private military — from inside a moving train.' },
    { title: 'Embedded', logline: 'A war journalist embedded with a special forces unit realises the squad is the story the government doesn\'t want told.' },
  ],

  'limited-series': [
    { title: 'Final Boarding', logline: 'Six strangers booked on the same flight discover mid-air that one of them is a target — and one of them is the killer.' },
    { title: 'The Catch', logline: 'A small coastal town is divided when a beloved fisherman is accused of a crime that rips open decades of secrets.' },
    { title: 'Off the Record', logline: 'A disgraced senator and the journalist who exposed her are both threatened by the same source — who knows everything.' },
    { title: 'Rising Water', logline: 'Seven days. Seven people. One apartment building. The story of the last week before the city floods.' },
    { title: 'The Other Life', logline: 'A woman sorting through her late mother\'s belongings discovers a second identity — and a family that doesn\'t know she\'s dead.' },
    { title: 'The Vial', logline: 'Two teams — one stopping a bioterror attack, one delivering what they believe is a cure — race toward the same target.' },
    { title: 'Eyewitness', logline: 'Four teenagers who witnessed an accident fifteen years ago are called to testify — and they all remember it differently.' },
    { title: 'The Demand', logline: 'A hostage negotiator discovers the kidnapper\'s demands reveal a cover-up that goes all the way to her own precinct.' },
  ],

  anthology: [
    { title: 'Five Seconds', logline: 'Each episode follows a different character touched by the same five-second news clip — seen from a completely new angle.' },
    { title: 'Room Service', logline: 'Standalone stories set in the same hotel over a hundred years, exploring who passes through — and who never leaves.' },
    { title: 'First Line', logline: 'Every episode is a love story — same opening line, different genre, different outcome.' },
    { title: 'Almost', logline: 'Stories about the moments people almost made a different choice — and the butterfly effects of what they chose instead.' },
    { title: 'Ride Along', logline: 'Each episode takes place entirely in one car on one drive — the conversations that change everything.' },
    { title: 'Credited', logline: 'Stories of the unsung people who built the modern world — the ones whose names aren\'t in the history books.' },
    { title: 'The Last Ordinary Day', logline: 'Each hour covers the final 24 hours before a life-changing event, from someone who doesn\'t know it\'s coming.' },
    { title: 'Delivered', logline: 'Seven people receive the same mysterious package on the same day — in seven different countries.' },
  ],

  'talk-show': [
    { title: 'Town to Town', logline: 'A talk show host decamps to a new city every week, interviewing locals about the issues that define their community.' },
    { title: 'On the Record', logline: 'A trio of journalists debate the headlines with radical transparency — including their own network\'s mistakes.' },
    { title: 'Two Perspectives', logline: 'A therapist and a comedian co-host a show where they unpack viral moments through radically different lenses.' },
    { title: 'Primary Source', logline: 'Roundtable conversations between people who lived through history-defining events and the historians who study them.' },
    { title: 'Unknown Speaker', logline: 'Every guest is anonymous — their identity revealed only after their story has been told.' },
    { title: 'Just the Data', logline: 'Scientists explain the week\'s biggest news using only evidence — no pundits, no spin, no talking heads.' },
    { title: 'Uninterrupted', logline: 'A long-form interview show where every guest is given the full hour and never once interrupted.' },
    { title: 'Convinced', logline: 'Ordinary people make the case for something they deeply believe in — and a live panel decides if any minds were changed.' },
  ],

  'late-night': [
    { title: 'The Evening Report', logline: 'A satirical newsroom where every correspondent is a genuine expert in their field — and none of them are comedians by training.' },
    { title: 'Last Round', logline: 'A comedian hosts from the city\'s most iconic dive bar, interviewing guests over drinks and darts.' },
    { title: 'Cold Open', logline: 'A late-night show structured entirely around viewer questions — no prepared jokes, no scripted segments, no safety net.' },
    { title: 'Your Call', logline: 'An improv-driven late night show where the guest decides the format — monologue, sketch, interview, or something entirely new.' },
    { title: 'Technically Speaking', logline: 'A comedy show that fact-checks its own jokes in real time, with a researcher who can interrupt at any moment.' },
    { title: 'First Time Out', logline: 'A midnight variety show where every single performer is making their television debut.' },
    { title: 'Down to the Wire', logline: 'A satirist takes one news story per episode and spends the full hour unpacking it until the absurdity is undeniable.' },
    { title: 'Nights Off', logline: 'A late-night host trades their desk for a different profession each week — working the job before interviewing its practitioners.' },
  ],

  'soap-opera': [
    { title: 'Deep Waters', logline: 'Three generations of a shipping dynasty battle for control of the family empire — each hiding a secret that could destroy it all.' },
    { title: 'House of Voss', logline: 'A fading glamour queen refuses to cede control of her fashion house to any of her four wildly different children.' },
    { title: 'Common Blood', logline: 'Rivals since childhood, two women discover they are half-sisters — weeks before they\'re both up for the same Senate seat.' },
    { title: 'Permanent Guests', logline: 'The staff of a five-star hotel become entangled in the lives and feuds of the powerful families who never leave.' },
    { title: 'Shore Leave', logline: 'A coastal resort town is torn apart when its founding family is revealed to have built their fortune on someone else\'s tragedy.' },
    { title: 'The Holdout', logline: 'When the matriarch of a media empire goes missing, her four heirs must hold the company together while secretly suspecting each other.' },
    { title: 'Bitter Vintage', logline: 'Two rival vineyard families have waged a feud for sixty years — until their children fall in love.' },
    { title: 'Second Practice', logline: 'A beloved small-town doctor\'s sudden death reveals he had a secret family in every town he ever worked in.' },
  ],
};
