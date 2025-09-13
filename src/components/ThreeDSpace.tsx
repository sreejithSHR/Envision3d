import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Grid, Center, Text } from '@react-three/drei';
import { Upload, Cube, Eye } from 'lucide-react';
import { Job } from '../types';
import * as THREE from 'three';

interface ModelProps {
  url: string;
}

const Model: React.FC<ModelProps> = ({ url }) => {
  const { scene } = useGLTF(url);
  const meshRef = useRef<any>();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && !hovered) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Center>
      <primitive
        ref={meshRef}
        object={scene}
        scale={hovered ? 1.1 : 1}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      />
    </Center>
  );
};

const GridPlane: React.FC = () => {
  return (
    <Grid
      args={[30, 30]}
      cellSize={1}
      cellThickness={0.8}
      cellColor="#e5e7eb"
      sectionSize={5}
      sectionThickness={1.2}
      sectionColor="#d1d5db"
      fadeDistance={35}
      fadeStrength={1}
      followCamera={false}
      infiniteGrid={true}
    />
  );
};

const ImagePlane: React.FC<{ image: File }> = ({ image }) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(image);
    const loader = new THREE.TextureLoader();
    loader.load(url, (loadedTexture) => {
      setTexture(loadedTexture);
    });
    return () => URL.revokeObjectURL(url);
  }, [image]);

  if (!texture) return null;

  return (
    <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[6, 6]} />
      <meshBasicMaterial map={texture} transparent opacity={0.9} />
    </mesh>
  );
};

const LoadingSpinner: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.7;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 2, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#fbbf24" wireframe />
    </mesh>
  );
};

interface ThreeDSpaceProps {
  selectedJob: Job | null;
  uploadedImage: File | null;
  onJobSelect: (job: Job) => void;
  jobs: Job[];
}

const ThreeDSpace: React.FC<ThreeDSpaceProps> = ({ 
  selectedJob, 
  uploadedImage, 
  onJobSelect, 
  jobs 
}) => {
  const completedJobs = jobs.filter(job => job.status === 'completed' && job.downloads?.glb);
  const processingJobs = jobs.filter(job => job.status === 'processing' || job.status === 'pending');

  return (
    <div className="h-full relative">
      {/* Top Status Bar */}
      <div className="absolute top-6 left-6 z-10 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <Cube className="w-5 h-5 text-gray-600" />
          <div>
            <h3 className="font-semibold text-gray-900">3D Workspace</h3>
            <p className="text-sm text-gray-600">
              {selectedJob && selectedJob.status === 'completed' 
                ? `Viewing: ${selectedJob.name}`
                : uploadedImage 
                  ? 'Image ready for generation'
                  : 'Upload an image to get started'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Model Selection Panel */}
      {completedJobs.length > 0 && (
        <div className="absolute top-6 right-6 z-10 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200 max-w-xs">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-gray-600" />
            <h4 className="font-semibold text-gray-900">Generated Models</h4>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {completedJobs.map((job) => (
              <button
                key={job.id}
                onClick={() => onJobSelect(job)}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  selectedJob?.id === job.id 
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                    : 'hover:bg-gray-100 text-gray-700 border border-transparent'
                }`}
              >
                <div className="font-medium truncate">{job.name}</div>
                <div className="text-xs text-gray-500">
                  {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Processing Status */}
      {processingJobs.length > 0 && (
        <div className="absolute bottom-6 left-6 z-10 bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <div>
              <p className="font-medium text-blue-900">
                {processingJobs.length} model{processingJobs.length > 1 ? 's' : ''} generating...
              </p>
              <p className="text-sm text-blue-700">
                {processingJobs[0]?.name} - {processingJobs[0]?.progress || 0}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [8, 6, 8], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
        className="bg-gradient-to-br from-gray-50 to-gray-100"
      >
        <Suspense fallback={<LoadingSpinner />}>
          <Environment preset="city" />
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.3} />
          
          <GridPlane />
          
          {uploadedImage && !selectedJob && (
            <ImagePlane image={uploadedImage} />
          )}
          
          {selectedJob && selectedJob.status === 'completed' && selectedJob.downloads?.glb && (
            <Model url={selectedJob.downloads.glb} />
          )}

          {processingJobs.length > 0 && !selectedJob && (
            <LoadingSpinner />
          )}
          
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={25}
            maxPolarAngle={Math.PI / 2.2}
            enableDamping={true}
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>

      {/* Empty State */}
      {!uploadedImage && !selectedJob && processingJobs.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-6 bg-white/90 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-gray-200">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <Upload className="w-10 h-10 text-gray-400" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">3D Workspace</h3>
              <p className="text-gray-600 max-w-sm">
                Upload an image to start generating your 3D model. Your creations will appear here in an interactive 3D environment.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeDSpace;