import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Grid, Center } from '@react-three/drei';
import { Upload } from 'lucide-react';
import { Job } from '../types';

interface ModelProps {
  url: string;
}

const Model: React.FC<ModelProps> = ({ url }) => {
  const { scene } = useGLTF(url);
  const meshRef = useRef<any>();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && !hovered) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
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
      args={[20, 20]}
      cellSize={1}
      cellThickness={0.5}
      cellColor="#e0e0e0"
      sectionSize={5}
      sectionThickness={1}
      sectionColor="#c0c0c0"
      fadeDistance={25}
      fadeStrength={1}
      followCamera={false}
      infiniteGrid={true}
    />
  );
};

const ImagePlane: React.FC<{ image: File }> = ({ image }) => {
  const [texture, setTexture] = useState<string>('');

  useEffect(() => {
    const url = URL.createObjectURL(image);
    setTexture(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  if (!texture) return null;

  return (
    <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[4, 4]} />
      <meshBasicMaterial map={new THREE.TextureLoader().load(texture)} transparent opacity={0.8} />
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

  return (
    <div className="h-full relative">
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
        <h3 className="font-medium text-gray-900 mb-2">3D Space</h3>
        <p className="text-sm text-gray-600">
          {selectedJob && selectedJob.status === 'completed' 
            ? `Viewing: ${selectedJob.name}`
            : uploadedImage 
              ? 'Upload an image to place it on the grid'
              : 'Upload an image to get started'
          }
        </p>
      </div>

      {completedJobs.length > 0 && (
        <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
          <h4 className="font-medium text-gray-900 mb-2">Generated Models</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {completedJobs.map((job) => (
              <button
                key={job.id}
                onClick={() => onJobSelect(job)}
                className={`block w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                  selectedJob?.id === job.id 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {job.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
        className="bg-gradient-to-br from-gray-100 to-gray-200"
      >
        <Suspense fallback={null}>
          <Environment preset="studio" />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          
          <GridPlane />
          
          {uploadedImage && !selectedJob && (
            <ImagePlane image={uploadedImage} />
          )}
          
          {selectedJob && selectedJob.status === 'completed' && selectedJob.downloads?.glb && (
            <Model url={selectedJob.downloads.glb} />
          )}
          
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={20}
            maxPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>

      {!uploadedImage && !selectedJob && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-4 bg-white/80 backdrop-blur-sm rounded-lg p-8">
            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">3D Space</h3>
              <p className="text-gray-600">Upload an image to place it on the grid</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeDSpace;