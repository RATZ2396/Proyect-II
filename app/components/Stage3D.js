'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, Float } from '@react-three/drei';
import { Coin3D } from './Coin3D';

// --- RESPONSIVE DYNAMIC LIGHTS ---
function DynamicLights() {
    const lightsRef = useRef();
    const { viewport } = useThree();

    // Responsive spread: narrower on mobile to avoid cut-off reflectors
    // viewport.width is in Three.js units (not pixels), typically 5-10 for mobile
    const spreadX = viewport.width < 6 ? 3 : 5;

    useFrame(({ clock }) => {
        if (!lightsRef.current) return;
        // Slow rotation of lights around the center
        lightsRef.current.rotation.y = clock.getElapsedTime() * 0.5;
    });

    return (
        <group ref={lightsRef}>
            {/* Orange reflector - responsive X position */}
            <pointLight position={[spreadX, 2, 5]} intensity={50} color="#ffaa00" distance={10} />
            {/* Blue/Cyan reflector - responsive X position */}
            <pointLight position={[-spreadX, 2, -5]} intensity={50} color="#ff8800" distance={10} />
            {/* Top white light */}
            <pointLight position={[0, 5, 0]} intensity={20} color="white" distance={8} />
        </group>
    );
}

// --- MAIN STAGE COMPONENT ---
export default function Stage3D({ onCoinClick, clickTrigger }) {
    return (
        // Use 100dvh for true full-screen on mobile
        <div className="fixed inset-0 w-full h-[100dvh] z-10 pointer-events-none">
            <Canvas
                shadows
                camera={{ position: [0, 4, 6], fov: 45 }}
                dpr={[1, 2]}
                gl={{ alpha: true, antialias: true }} // Transparent background
                style={{ pointerEvents: 'none' }} // Pass-through to DOM hitbox
            >
                {/* Ambient Light */}
                <ambientLight intensity={0.4} />

                {/* Responsive Dynamic Lights */}
                <DynamicLights />

                {/* The 3D Coin - POSITIONED HIGHER (Y = 0.8) */}
                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
                    <group position={[0, 0.8, 0]}> {/* COIN Y-POSITION RAISED */}
                        <Coin3D onClick={onCoinClick} clickTrigger={clickTrigger} />
                    </group>
                </Float>

                {/* HDRI Environment for metallic reflections */}
                <Environment preset="city" />

                {/* Contact Shadows (adjusted for new coin height) */}
                <ContactShadows position={[0, -1.2, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
            </Canvas>
        </div>
    );
}
