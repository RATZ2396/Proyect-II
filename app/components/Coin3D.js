'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

export function Coin3D({ onClick, clickTrigger }) {
    const meshRef = useRef();
    const [active, setActive] = useState(false);

    // External Trigger Listener (Syncs with DOM clicks)
    useEffect(() => {
        if (clickTrigger && clickTrigger > 0) {
            setActive(true);
            // Visual Pop on trigger
            if (meshRef.current) {
                meshRef.current.rotation.x += 0.5;
            }
            const t = setTimeout(() => setActive(false), 150);
            return () => clearTimeout(t);
        }
    }, [clickTrigger]);

    // Animation Loop
    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Continuous slow rotation (Idle)
        meshRef.current.rotation.y += delta * 0.5;

        // Click animation: scale pulse
        if (active) {
            meshRef.current.scale.lerp({ x: 0.85, y: 0.85, z: 0.85 }, 0.25);
        } else {
            meshRef.current.scale.lerp({ x: 1, y: 1, z: 1 }, 0.1);
        }
    });

    const handlePointerDown = (e) => {
        e.stopPropagation();
        setActive(true);
        onClick && onClick(e);
        if (meshRef.current) {
            meshRef.current.rotation.x += 0.5;
        }
        setTimeout(() => setActive(false), 100);
    };

    return (
        <mesh
            ref={meshRef}
            rotation={[Math.PI / 2, 0, 0]} // Laying flat so face looks at camera
            onPointerDown={handlePointerDown}
            scale={1.5}
        >
            {/* Cylinder: TopRadius, BottomRadius, Height, Segments */}
            <cylinderGeometry args={[2.5, 2.5, 0.3, 64]} />

            {/* Gold Metallic Material */}
            <meshStandardMaterial
                color="#FFD700"
                metalness={0.95}
                roughness={0.15}
                envMapIntensity={1.5}
            />
        </mesh>
    );
}
