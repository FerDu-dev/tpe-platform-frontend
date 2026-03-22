import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Typography, Space, Tag, Avatar } from 'antd';
import { UserOutlined, TrophyOutlined, ArrowRightOutlined } from '@ant-design/icons';
import confetti from 'canvas-confetti';
import type { Candidate, Requisition } from '../../../types';

const { Text, Title } = Typography;

interface HiringAnimationProps {
    candidate: Candidate;
    requisition: Requisition;
    onComplete: () => void;
    isBackendReady?: boolean; // New prop to wait for backend
}

const HiringAnimation: React.FC<HiringAnimationProps> = ({ candidate, requisition, onComplete, isBackendReady = true }) => {
    const [phase, setPhase] = useState<'initial' | 'catching' | 'success'>('initial');
    const [animationDone, setAnimationDone] = useState(false); // State to wait for motion done

    const companyName = typeof requisition.company === 'object' ? (requisition.company as any).name : requisition.company;

    useEffect(() => {
        // Start catching after a longer initial delay for builds anticipation
        const timer = setTimeout(() => {
            setPhase('catching');
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Trigger success only if BOTH animation and backend are ready
        if (phase === 'catching' && animationDone && isBackendReady) {
            handleCatchComplete();
        }
    }, [phase, animationDone, isBackendReady]);

    const handleCatchComplete = () => {
        setPhase('success');
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#52c41a', '#1890ff', '#faad14']
        });
        
        // Finalize after showing success for a bit longer
        setTimeout(() => {
            onComplete();
        }, 4000);
    };

    return (
        <div style={{ 
            height: '350px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f0f2f5 0%, #ffffff 100%)',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative'
        }}>
            <AnimatePresence>
                {phase !== 'success' && (
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ 
                            opacity: phase === 'catching' ? 0 : 1, 
                            x: phase === 'catching' ? 450 : 0,
                            scale: phase === 'catching' ? 0 : 1,
                            rotate: phase === 'catching' ? 360 : 0,
                            filter: phase === 'catching' ? 'blur(10px) brightness(3)' : 'blur(0px) brightness(1)'
                        }}
                        transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }} // Slower catching motion
                        onAnimationComplete={() => {
                            if (phase === 'catching') {
                                setAnimationDone(true);
                            }
                        }}
                        style={{ position: 'absolute', left: '10%', zIndex: 10 }}
                    >
                        <Card 
                            size="small" 
                            style={{ 
                                width: 220, 
                                borderRadius: 12, 
                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                border: '2px solid #52c41a',
                                background: '#fff'
                            }}
                        >
                            <Space direction="vertical" align="center" style={{ width: '100%' }}>
                                <div style={{ position: 'relative' }}>
                                    <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#52c41a' }} />
                                    {phase === 'catching' && (
                                        <motion.div 
                                            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                                            transition={{ duration: 0.5, repeat: Infinity }}
                                            style={{ 
                                                position: 'absolute', 
                                                top: 0, left: 0, right: 0, bottom: 0, 
                                                background: '#52c41a', 
                                                borderRadius: '50%' 
                                            }}
                                        />
                                    )}
                                </div>
                                <Title level={5} style={{ margin: '8px 0 0' }}>{candidate.firstName} {candidate.lastName}</Title>
                                <Tag color="green">{candidate.profession}</Tag>
                            </Space>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Target Requisition (The Pokeball) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                    opacity: 1, 
                    scale: phase === 'success' ? 1.1 : 1,
                    x: phase === 'success' ? 0 : 0, // Keep it relatively right until success
                    boxShadow: phase === 'success' ? '0 0 50px rgba(82, 196, 26, 0.6)' : '0 8px 24px rgba(0,0,0,0.08)',
                    borderColor: phase === 'success' ? '#52c41a' : '#1890ff'
                }}
                transition={{ duration: 0.5, type: 'spring' }}
                style={{ 
                    position: phase === 'success' ? 'relative' : 'absolute', 
                    right: phase === 'success' ? 'auto' : '10%',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                <Card 
                    size="small" 
                    className={phase === 'catching' ? 'shake-animation' : ''}
                    style={{ 
                        width: 240, 
                        borderRadius: 16, 
                        borderWidth: 3,
                        borderStyle: 'solid',
                        background: phase === 'success' ? '#f6ffed' : '#ffffff',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <Space direction="vertical" align="center" style={{ width: '100%' }}>
                        <motion.div 
                            animate={phase === 'catching' ? { 
                                rotate: [0, -10, 10, -10, 10, 0],
                                scale: [1, 1.1, 1]
                            } : {}}
                            transition={phase === 'catching' ? { 
                                duration: 0.8, 
                                repeat: isBackendReady ? 2 : Infinity // Keep shaking if not ready
                            } : {}}
                            style={{ 
                                width: 72, 
                                height: 72, 
                                borderRadius: '50%', 
                                background: phase === 'success' ? '#52c41a' : '#1890ff', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: 36,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        >
                            {phase === 'success' ? <TrophyOutlined /> : <ArrowRightOutlined />}
                        </motion.div>
                        <Title level={4} style={{ margin: '12px 0 0', textAlign: 'center' }}>{requisition.title}</Title>
                        <Text type="secondary" style={{ fontSize: 13 }}>{companyName}</Text>
                        
                        <AnimatePresence>
                            {phase === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ marginTop: 16, textAlign: 'center' }}
                                >
                                    <Tag color="gold" style={{ fontSize: 16, padding: '6px 12px', borderRadius: 8, fontWeight: 'bold' }}>
                                        🎯 ¡VINCULADO!
                                    </Tag>
                                    <div style={{ marginTop: 8 }}>
                                        <Text strong style={{ color: '#52c41a' }}>Candidato contratado</Text>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Space>
                </Card>
            </motion.div>

            {/* Energy Beam during catching */}
            {phase === 'catching' && (
                <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ 
                        opacity: [0, 1, 0.5, 0], 
                        width: [0, 400],
                        x: [0, 200]
                    }}
                    transition={{ duration: 1.8 }}
                    style={{ 
                        position: 'absolute', 
                        left: '20%',
                        height: 4,
                        background: 'linear-gradient(90deg, transparent, #52c41a, #fff, #1890ff, transparent)',
                        filter: 'blur(4px)',
                        zIndex: 5,
                        boxShadow: '0 0 20px #52c41a'
                    }}
                />
            )}

        </div>
    );
};

export default HiringAnimation;
