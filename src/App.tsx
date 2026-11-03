import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { OpeningSequence } from './components/OpeningSequence';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { JourneySection } from './components/JourneySection';
import { PersonalGallery } from './components/PersonalGallery';
import { DailyMotivation } from './components/DailyMotivation';
import { DisciplineWall } from './components/DisciplineWall';
import { FriendshipHumor } from './components/FriendshipHumor';
import { FinalDedication } from './components/FinalDedication';
import { FullscreenLightbox } from './components/FullscreenLightbox';
import { BHASKAR_PHOTOS, GalleryPhoto } from './data/tributeData';
import { soundFX } from './utils/audio';

export default function App() {
  const [showOpening, setShowOpening] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [fistBumps, setFistBumps] = useState(42);
  const [activeLightboxPhoto, setActiveLightboxPhoto] = useState<GalleryPhoto | null>(null);

  const toggleAudio = () => {
    const nextState = !audioEnabled;
    setAudioEnabled(nextState);
    soundFX.setMuted(!nextState);
    if (nextState) {
      soundFX.playFistBump();
    }
  };

  const handleSendFistBump = () => {
    setFistBumps((prev) => prev + 1);
  };

  const handleReplayIntro = () => {
    setShowOpening(true);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-[#FF6B1A] selection:text-white font-sans antialiased overflow-x-hidden relative film-grain">
      {/* Cinematic Opening Sequence */}
      <AnimatePresence>
        {showOpening && (
          <OpeningSequence
            onComplete={() => setShowOpening(false)}
            audioEnabled={audioEnabled}
            onToggleAudio={toggleAudio}
          />
        )}
      </AnimatePresence>

      {/* Persistent Cinematic Header */}
      <Header
        audioEnabled={audioEnabled}
        onToggleAudio={toggleAudio}
        onReplayIntro={handleReplayIntro}
        fistBumps={fistBumps}
        onSendFistBump={handleSendFistBump}
      />

      {/* Main Tribute Flow */}
      <main>
        {/* 1. Hero Section */}
        <HeroSection
          onReplayIntro={handleReplayIntro}
          audioEnabled={audioEnabled}
        />

        {/* 2. Personal Gallery (The Man. The Grind. The Journey.) */}
        <PersonalGallery
          onOpenLightbox={(photo) => setActiveLightboxPhoto(photo)}
          audioEnabled={audioEnabled}
        />

        {/* 3. Daily Motivation Auto-Rotating Carousel */}
        <DailyMotivation
          audioEnabled={audioEnabled}
        />

        {/* 4. Journey & Consistency Chapter */}
        <JourneySection />

        {/* 5. Discipline Wall (Giant Monolithic Typography) */}
        <DisciplineWall
          audioEnabled={audioEnabled}
        />

        {/* 6. Funny Friendship & Brotherhood Section */}
        <FriendshipHumor
          audioEnabled={audioEnabled}
          onSendFistBump={handleSendFistBump}
          fistBumps={fistBumps}
        />

        {/* 7. Final Dedication & Respect the Grind */}
        <FinalDedication
          audioEnabled={audioEnabled}
          onSendFistBump={handleSendFistBump}
          fistBumps={fistBumps}
        />
      </main>

      {/* Fullscreen Lightbox Image Viewer */}
      <FullscreenLightbox
        photo={activeLightboxPhoto}
        photos={BHASKAR_PHOTOS}
        onClose={() => setActiveLightboxPhoto(null)}
        onSelectPhoto={(photo) => setActiveLightboxPhoto(photo)}
        audioEnabled={audioEnabled}
      />
    </div>
  );
}
