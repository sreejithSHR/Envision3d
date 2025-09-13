import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Maximize, RotateCcw } from 'lucide-react';
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

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="space-y-4 text-center">
      <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-sm text-gray-400">Loading 3D model...</p>
    </div>
  </div>
);

interface ModelViewerProps {
  selectedJob: Job | null;
  onDownload: (job: Job, format: 'glb' | 'ply' | 'mp4') => void;
}

const ModelViewer: React.FC<ModelViewerProps> = ({ selectedJob, onDownload }) => {
  const controlsRef = useRef<any>();

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  if (!selectedJob || selectedJob.status !== 'completed' || !selectedJob.downloads?.glb) {
    return (
      <Card className="h-full">
        <CardContent className="p-8 flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
              <div className="w-8 h-8 border-2 border-gray-600 rounded-full" />
            </div>
            <div>
              <h3 className="text-lg font-medium">No Model Selected</h3>
              <p className="text-gray-400">Select a completed job to view the 3D model.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg truncate">{selectedJob.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetCamera}
              title="Reset Camera"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              title="Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-4">
        <div className="h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden">
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            style={{ width: '100%', height: '100%' }}
          >
            <Suspense fallback={null}>
              <Environment preset="studio" />
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <Model url={selectedJob.downloads.glb!} />
              <OrbitControls
                ref={controlsRef}
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={2}
                maxDistance={10}
              />
            </Suspense>
          </Canvas>
          
          {/* Loading overlay */}
          <Suspense fallback={<LoadingSpinner />} />
        </div>

        <div className="flex items-center justify-center gap-2 mt-4">
          {selectedJob.downloads.glb && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(selectedJob, 'glb')}
              className="bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20"
            >
              <Download className="w-3 h-3 mr-1" />
              Download GLB
            </Button>
          )}
          
          {selectedJob.downloads.ply && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(selectedJob, 'ply')}
            >
              <Download className="w-3 h-3 mr-1" />
              PLY
            </Button>
          )}
          
          {selectedJob.downloads.mp4 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(selectedJob, 'mp4')}
            >
              <Download className="w-3 h-3 mr-1" />
              MP4
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelViewer;