import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Text, Edges, TransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Plus as LucidePlus, 
  Trash2 as LucideTrash2, 
  RotateCw as LucideRotateCw, 
  Truck as LucideTruck, 
  AlertTriangle as LucideAlertTriangle, 
  CheckCircle as LucideCheckCircle, 
  Palette as LucidePalette, 
  ChevronUp as LucideChevronUp, 
  ChevronDown as LucideChevronDown, 
  Maximize as LucideMaximize, 
  Settings2 as LucideSettings2, 
  ShieldCheck as LucideShieldCheck, 
  Compass as LucideCompass, 
  Layers as LucideLayers,
  Hand as LucideHand,
  MousePointer2 as LucidePointer,
  Save as LucideSave,
  Grid3X3 as LucideNet,
  Undo as LucideUndo,
  Redo as LucideRedo
} from 'lucide-react';

// --- Constants & Library ---

const CONTAINER_TYPES = {
  '20GP': { label: '20FT (GP)', width: 5898, height: 2393, depth: 2352 },
  '40GP': { label: '40FT (GP)', width: 12032, height: 2393, depth: 2352 },
  '40HQ': { label: '40HQ (HQ)', width: 12032, height: 2698, depth: 2352 },
  '40TR': { label: 'TRIALO(HQ)', width: 12030, height: 2690, depth: 2350 }
};

const MODEL_LIBRARY = [
  { model: "FQ803", size: "20", length: 385, width: 255, height: 576 },
  { model: "FQ803", size: "21", length: 440, width: 255, height: 570 },
  { model: "FQ803", size: "29", length: 537, width: 300, height: 789 },
  { model: "FQ803", size: "24", length: 461, width: 295, height: 686 },
  { model: "FL688", size: "16", length: 375, width: 245, height: 422 },
  { model: "FL688", size: "17", length: 435, width: 245, height: 422 },
  { model: "FL688", size: "21", length: 421, width: 255, height: 566 },
  { model: "FL688", size: "24", length: 461, width: 295, height: 686 },
  { model: "FL688", size: "19", length: 424, width: 242, height: 577 },
  { model: "FL688", size: "29", length: 537, width: 300, height: 789 },
  { model: "FL688", size: "20", length: 385, width: 255, height: 576 },
  { model: "FL688", size: "31", length: 411, width: 350, height: 811 },
  { model: "FL688", size: "32", length: 581, width: 345, height: 883 },
  { model: "FL688", size: "29.5", length: 420, width: 385, height: 807 },
  { model: "FJ616", size: "16", length: 424, width: 228, height: 440 },
  { model: "FJ616", size: "20", length: 382, width: 262, height: 582 },
  { model: "FJ616", size: "24", length: 467, width: 285, height: 692 },
  { model: "FJ616", size: "19.5", length: 415, width: 235, height: 600 },
  { model: "FJ616", size: "29", length: 522, width: 292, height: 792 },
  { model: "FJ616", size: "31", length: 400, width: 340, height: 830 },
  { model: "FJ616", size: "32", length: 558, width: 325, height: 880 },
  { model: "FQ819-1", size: "21", length: 634, width: 419, height: 258 },
  { model: "FQ819-1", size: "26", length: 757, width: 469, height: 293 },
  { model: "FQ819-1", size: "29", length: 845, width: 519, height: 333 },
  { model: "FR873", size: "21", length: 255, width: 365, height: 580 },
  { model: "FR873", size: "22", length: 280, width: 390, height: 600 },
  { model: "FR873", size: "25", length: 315, width: 485, height: 680 },
  { model: "FR873", size: "29", length: 350, width: 535, height: 750 },
  { model: "FL678", size: "19.5", length: 410, width: 207, height: 548 },
  { model: "FL678", size: "20", length: 240, width: 370, height: 568 },
  { model: "FL678", size: "21", length: 355, width: 240, height: 575 },
  { model: "FL678", size: "25", length: 459, width: 283, height: 685 },
  { model: "FL678", size: "28", length: 504, width: 315, height: 750 },
  { model: "FQ822", size: "19.5", length: 210, width: 412, height: 569 },
  { model: "FQ822", size: "20", length: 240, width: 370, height: 568 },
  { model: "FQ822", size: "21", length: 248, width: 407, height: 600 },
  { model: "FQ822", size: "25", length: 288, width: 480, height: 703 },
  { model: "FQ822", size: "28", length: 320, width: 520, height: 775 },
  { model: "FQ822", size: "31", length: 340, width: 600, height: 860 },
  { model: "F1627-5", size: "S Lite 19", length: 535, width: 360, height: 220 },
  { model: "F1627-5", size: "Fit Lite 28", length: 690, width: 440, height: 350 },
  { model: "F1627-5", size: "Fit L 29.5", length: 765, width: 450, height: 350 },
  { model: "F1627-5", size: "S 21", length: 551, width: 279, height: 386 },
  { model: "F1627-5", size: "M 26", length: 650, width: 315, height: 470 },
  { model: "F1627-5", size: "L 30", length: 790, width: 351, height: 569 },
  { model: "F1627-5-01", size: "S 21", length: 551, width: 279, height: 386 },
  { model: "F1627-5-01", size: "M 26", length: 650, width: 315, height: 470 },
  { model: "F1627-5-01", size: "L 30", length: 790, width: 351, height: 569 },
  { model: "F1628-5-01", size: "Fit L 29.5", length: 780, width: 371, height: 480 },
  { model: "F1627-5-01", size: "S Lite 21", length: 551, width: 236, height: 386 },
  { model: "F1628-5-01", size: "Fit Lite 28", length: 701, width: 371, height: 465 },
  { model: "PP12-3", size: "S#", length: 561, width: 391, height: 244 },
  { model: "PP12-3", size: "M#", length: 681, width: 475, height: 282 },
  { model: "PP12-3", size: "L#", length: 790, width: 551, height: 330 },
  { model: "PP12-3", size: "SML#", length: 790, width: 551, height: 330 },
];

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

// --- Types ---

interface CargoItem {
  id: string;
  model: string;
  size: string;
  qty: number;
  color: string;
}

interface ContainerInstance {
  id: string;
  type: keyof typeof CONTAINER_TYPES;
  items: CargoItem[];
  hasNet?: boolean;
}

interface PackedBox {
  id: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  color: string;
  modelInfo: string;
  itemId: string;
}

interface PackingResult {
  containerId: string;
  containerType: keyof typeof CONTAINER_TYPES;
  packedBoxes: PackedBox[];
  unfitItems: { model: string; size: string; count: number }[];
  packedVolume: number;
  totalVolume: number;
  hasNet?: boolean;
}

interface HistoryState {
  containers: ContainerInstance[];
  results: PackingResult[];
}

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Strategic No-Gap Packing Logic ---

function packBoxesOptimized(containers: ContainerInstance[]): PackingResult[] {
  const results: PackingResult[] = [];

  containers.forEach(containerInst => {
    const cType = CONTAINER_TYPES[containerInst.type];
    const packedBoxes: PackedBox[] = [];
    
    let loadingTasks = containerInst.items.map(item => {
      const match = MODEL_LIBRARY.find(m => m.model === item.model && m.size === item.size);
      const dims = match ? { l: match.length, w: match.width, h: match.height } : { l: 200, w: 200, h: 200 };
      return { ...dims, item };
    });

    loadingTasks.sort((a, b) => (b.l * b.w * b.h) - (a.l * a.w * a.h));

    let points = [{ x: 0, y: 0, z: 0 }];
    const unfitTracker: Record<string, number> = {};

    loadingTasks.forEach(task => {
      let qtyRemaining = task.item.qty;

      const allRotations = [
        [task.l, task.w, task.h],
        [task.l, task.h, task.w],
        [task.w, task.l, task.h],
        [task.w, task.h, task.l],
        [task.h, task.l, task.w],
        [task.h, task.w, task.l],
      ];

      const sortedRotations = [...allRotations];

      while (qtyRemaining > 0) {
        let bestPlacement: { pIndex: number, rotation: number[], x: number, y: number, z: number } | null = null;
        
        // Strict Priority: 
        // 1. Back Wall to Door (X)
        // 2. Bottom to Top (Y)
        // 3. Left to Right (Z)
        points.sort((a, b) => 
          (a.x - b.x) || 
          (a.y - b.y) || 
          (a.z - b.z)
        );

        // Sort rotations to prefer "wall-hugging" (smallest dimension along X)
        const sortedRotations = [...allRotations].sort((a, b) => a[0] - b[0]);

        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          for (const rotation of sortedRotations) {
            const [rw, rh, rd] = rotation;
            if (p.x + rw > cType.width || p.y + rh > cType.height || p.z + rd > cType.depth) continue;

            const hasCollision = packedBoxes.some(pb => (
              p.x < pb.x + pb.width - 0.5 && p.x + rw > pb.x + 0.5 &&
              p.y < pb.y + pb.height - 0.5 && p.y + rh > pb.y + 0.5 &&
              p.z < pb.z + pb.depth - 0.5 && p.z + rd > pb.z + 0.5
            ));
            if (hasCollision) continue;

            // Physical support check (80% area)
            if (p.y > 0) {
              let supportArea = 0;
              for (const pb of packedBoxes) {
                if (Math.abs(pb.y + pb.height - p.y) < 1.0) {
                  const ix = Math.max(0, Math.min(p.x + rw, pb.x + pb.width) - Math.max(p.x, pb.x));
                  const iz = Math.max(0, Math.min(p.z + rd, pb.z + pb.depth) - Math.max(p.z, pb.z));
                  supportArea += ix * iz;
                }
              }
              if (supportArea < rw * rd * 0.8) continue;
            }

            // First fit found based on strict point priority
            bestPlacement = { pIndex: i, rotation, x: p.x, y: p.y, z: p.z };
            break;
          }
          if (bestPlacement) break;
        }

        if (bestPlacement) {
          const [rw, rh, rd] = bestPlacement.rotation;
          packedBoxes.push({
            id: generateId(),
            x: bestPlacement.x, y: bestPlacement.y, z: bestPlacement.z,
            width: rw, height: rh, depth: rd,
            color: task.item.color,
            modelInfo: `${task.item.model} (${task.item.size}")`,
            itemId: task.item.id
          });
          points.push({ x: bestPlacement.x + rw, y: bestPlacement.y, z: bestPlacement.z });
          points.push({ x: bestPlacement.x, y: bestPlacement.y + rh, z: bestPlacement.z });
          points.push({ x: bestPlacement.x, y: bestPlacement.y, z: bestPlacement.z + rd });
          points.splice(bestPlacement.pIndex, 1);
          points = points.filter((pt, idx, self) => {
            const submerged = packedBoxes.some(pb => 
              pt.x >= pb.x && pt.x < pb.x + pb.width - 0.5 &&
              pt.y >= pb.y && pt.y < pb.y + pb.height - 0.5 &&
              pt.z >= pb.z && pt.z < pb.z + pb.depth - 0.5
            );
            if (submerged) return false;
            return !self.slice(0, idx).some(other => Math.abs(other.x - pt.x) < 0.5 && Math.abs(other.y - pt.y) < 0.5 && Math.abs(other.z - pt.z) < 0.5);
          });
          qtyRemaining--;
        } else {
          const key = `${task.item.model}-${task.item.size}`;
          unfitTracker[key] = (unfitTracker[key] || 0) + qtyRemaining;
          break;
        }
      }
    });

    results.push({
      containerId: containerInst.id,
      containerType: containerInst.type,
      packedBoxes,
      unfitItems: Object.entries(unfitTracker).map(([k, v]) => ({ model: k.split('-')[0], size: k.split('-')[1], count: v })),
      packedVolume: packedBoxes.reduce((acc, b) => acc + b.width * b.height * b.depth, 0),
      totalVolume: cType.width * cType.height * cType.depth,
      hasNet: containerInst.hasNet
    });
  });

  return results;
}

// --- Physics & Collision Utils ---

function checkCollision(box: PackedBox, allBoxes: PackedBox[], containerType: keyof typeof CONTAINER_TYPES, netX?: number): boolean {
  const cType = CONTAINER_TYPES[containerType];
  
  // Container Walls
  if (box.x < 0 || box.y < 0 || box.z < 0) return true;
  if (box.x + box.width > cType.width || box.y + box.height > cType.height || box.z + box.depth > cType.depth) return true;
  
  // Net Boundary
  if (netX !== undefined && box.x + box.width > netX) return true;

  // Other Boxes
  return allBoxes.some(other => {
    if (other.id === box.id) return false;
    return (
      box.x < other.x + other.width - 1 &&
      box.x + box.width > other.x + 1 &&
      box.y < other.y + other.height - 1 &&
      box.y + box.height > other.y + 1 &&
      box.z < other.z + other.depth - 1 &&
      box.z + box.depth > other.z + 1
    );
  });
}

function applyGravity(box: PackedBox, allBoxes: PackedBox[], containerType: keyof typeof CONTAINER_TYPES, netX?: number): PackedBox {
  let current = { ...box };
  let settled = false;
  
  while (!settled) {
    let next = { ...current, y: current.y - 10 }; // Step down 10mm
    if (next.y < 0 || checkCollision(next, allBoxes, containerType, netX)) {
      settled = true;
    } else {
      current = next;
    }
  }
  
  // Also settle towards back (X-axis) for tighter stuffing
  settled = false;
  while (!settled) {
    let next = { ...current, x: current.x - 10 };
    if (next.x < 0 || checkCollision(next, allBoxes, containerType, netX)) {
      settled = true;
    } else {
      current = next;
    }
  }

  return current;
}

function findBestRotation(centerX: number, centerY: number, centerZ: number, originalBox: PackedBox, allBoxes: PackedBox[], containerType: keyof typeof CONTAINER_TYPES, netX?: number): PackedBox | null {
  const dims = [originalBox.width, originalBox.height, originalBox.depth];
  
  // All 6 unique permutations of dimensions
  const perms: [number, number, number][] = [];
  const rawPerms = [
    [dims[0], dims[1], dims[2]], [dims[0], dims[2], dims[1]],
    [dims[1], dims[0], dims[2]], [dims[1], dims[2], dims[0]],
    [dims[2], dims[0], dims[1]], [dims[2], dims[1], dims[0]]
  ];
  const seen = new Set<string>();
  for(const p of rawPerms) {
    const s = p.join(',');
    if(!seen.has(s)) {
      perms.push(p as [number, number, number]);
      seen.add(s);
    }
  }

  let best: PackedBox | null = null;
  let minScore = Infinity;

  for (const [rw, rh, rd] of perms) {
    const testBox = {
      ...originalBox,
      width: rw,
      height: rh,
      depth: rd,
      x: centerX - rw / 2,
      y: centerY - rh / 2,
      z: centerZ - rd / 2
    };

    if (!checkCollision(testBox, allBoxes, containerType, netX)) {
      // Score: prioritize lower Y, then lower X (back wall), then original rotation if possible
      const score = testBox.y * 10 + testBox.x; 
      if (score < minScore) {
        minScore = score;
        best = testBox;
      }
    }
  }
  return best;
}

// --- Components ---

interface Box3DProps {
  box: PackedBox;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isManualMode: boolean;
  transformMode: 'translate' | 'rotate';
  onUpdate: (id: string, updates: Partial<PackedBox>) => void;
  allBoxes: PackedBox[];
  containerType: keyof typeof CONTAINER_TYPES;
  netX?: number;
}

const Box3D: React.FC<Box3DProps> = ({ box, isSelected, onSelect, isManualMode, transformMode, onUpdate, allBoxes, containerType, netX }) => {
  const s = 0.001; 
  const meshRef = useRef<THREE.Mesh>(null);
  const lastValidPos = useRef({ x: box.x, y: box.y, z: box.z, width: box.width, height: box.height, depth: box.depth });
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    lastValidPos.current = { x: box.x, y: box.y, z: box.z, width: box.width, height: box.height, depth: box.depth };
    setIsValid(true);
  }, [box.x, box.y, box.z, box.width, box.height, box.depth]);

  return (
    <group>
      <mesh 
        ref={meshRef}
        position={[(box.x + box.width / 2) * s, (box.y + box.height / 2) * s, (box.z + box.depth / 2) * s]} 
        castShadow 
        receiveShadow
        onClick={(e) => {
          if (isManualMode) {
            e.stopPropagation();
            onSelect(box.id);
          }
        }}
      >
        <boxGeometry args={[box.width * s, box.height * s, box.depth * s]} />
        <meshStandardMaterial 
          color={isValid ? box.color : "#ef4444"} 
          roughness={0.3} 
          metalness={0.05} 
          emissive={isSelected ? (isValid ? "#ffffff" : "#ff0000") : "#000000"}
          emissiveIntensity={isSelected ? 0.2 : 0}
          transparent={!isValid}
          opacity={isValid ? 1 : 0.7}
        />
        <Edges color={isSelected ? (isValid ? "#3b82f6" : "#ef4444") : "#000"} threshold={15} opacity={isSelected ? 1 : 0.6} transparent />
      </mesh>

      {isSelected && isManualMode && (
        <TransformControls 
          object={meshRef.current || undefined} 
          mode={transformMode}
          onObjectChange={() => {
            if (meshRef.current) {
              const pos = meshRef.current.position;
              const rot = meshRef.current.rotation;
              const cType = CONTAINER_TYPES[containerType];
              
              // Clamp to container boundaries to prevent passing through walls
              const minX = (box.width / 2) * s;
              const maxX = (cType.width - box.width / 2) * s;
              const minY = (box.height / 2) * s;
              const maxY = (cType.height - box.height / 2) * s;
              const minZ = (box.depth / 2) * s;
              const maxZ = (cType.depth - box.depth / 2) * s;

              pos.x = Math.max(minX, Math.min(maxX, pos.x));
              pos.y = Math.max(minY, Math.min(maxY, pos.y));
              pos.z = Math.max(minZ, Math.min(maxZ, pos.z));

              const centerX = pos.x / s;
              const centerY = pos.y / s;
              const centerZ = pos.z / s;
              
              if (transformMode === 'translate') {
                const bestFit = findBestRotation(centerX, centerY, centerZ, box, allBoxes, containerType, netX);
                if (bestFit) {
                  meshRef.current.scale.set(
                    bestFit.width / box.width,
                    bestFit.height / box.height,
                    bestFit.depth / box.depth
                  );
                  if (!isValid) setIsValid(true);
                } else {
                  if (isValid) setIsValid(false);
                }
              } else {
                // In rotate mode, we check collision with current rotation
                // We'll approximate the box as its current dimensions for collision during drag
                const currentBox = {
                  ...box,
                  x: centerX - box.width / 2,
                  y: centerY - box.height / 2,
                  z: centerZ - box.depth / 2
                };
                setIsValid(!checkCollision(currentBox, allBoxes, containerType, netX));
              }
            }
          }}
          onMouseUp={() => {
            if (meshRef.current) {
              const pos = meshRef.current.position;
              const rot = meshRef.current.rotation;
              const centerX = pos.x / s;
              const centerY = pos.y / s;
              const centerZ = pos.z / s;

              if (transformMode === 'translate') {
                const bestFit = findBestRotation(centerX, centerY, centerZ, box, allBoxes, containerType, netX);
                if (!bestFit) {
                  onUpdate(box.id, lastValidPos.current);
                  if (meshRef.current) meshRef.current.scale.set(1, 1, 1);
                  setIsValid(true);
                } else {
                  const settledBox = applyGravity(bestFit, allBoxes, containerType, netX);
                  onUpdate(box.id, { 
                    x: settledBox.x, 
                    y: settledBox.y, 
                    z: settledBox.z,
                    width: settledBox.width,
                    height: settledBox.height,
                    depth: settledBox.depth
                  });
                  if (meshRef.current) meshRef.current.scale.set(1, 1, 1);
                  setIsValid(true);
                }
              } else {
                // Rotate mode: detect which axis was rotated 90 deg and swap dimensions
                const euler = new THREE.Euler().setFromQuaternion(meshRef.current.quaternion);
                const rx = Math.round(euler.x / (Math.PI / 2));
                const ry = Math.round(euler.y / (Math.PI / 2));
                const rz = Math.round(euler.z / (Math.PI / 2));
                
                // For simplicity, we'll just use the auto-rotate logic to find the best fit 
                // in the current position after a manual rotation attempt
                const bestFit = findBestRotation(centerX, centerY, centerZ, box, allBoxes, containerType, netX);
                if (bestFit) {
                  onUpdate(box.id, { 
                    x: bestFit.x, y: bestFit.y, z: bestFit.z,
                    width: bestFit.width, height: bestFit.height, depth: bestFit.depth
                  });
                } else {
                  onUpdate(box.id, lastValidPos.current);
                }
                meshRef.current.rotation.set(0, 0, 0);
                setIsValid(true);
              }
            }
          }}
        />
      )}
    </group>
  );
};

const Container3D: React.FC<{ 
  result: PackingResult; 
  offset: [number, number, number];
  selectedBoxId: string | null;
  onSelectBox: (id: string) => void;
  isManualMode: boolean;
  transformMode: 'translate' | 'rotate';
  onUpdateBox: (containerId: string, boxId: string, updates: Partial<PackedBox>) => void;
}> = ({ result, offset, selectedBoxId, onSelectBox, isManualMode, transformMode, onUpdateBox }) => {
  const cType = CONTAINER_TYPES[result.containerType];
  const s = 0.001;

  const netX = useMemo(() => {
    if (!result.hasNet) return undefined;
    const maxX = result.packedBoxes.reduce((max, b) => Math.max(max, b.x + b.width), 0);
    return maxX + 50; // 50mm buffer
  }, [result.hasNet, result.packedBoxes]);

  return (
    <group position={offset}>
      <group rotation={[0, 0, 0]} position={[0, 0, 0]}>
        <mesh position={[(cType.width / 2) * s, (cType.height / 2) * s, (cType.depth / 2) * s]}>
          <boxGeometry args={[cType.width * s, cType.height * s, cType.depth * s]} />
          <meshBasicMaterial transparent opacity={0.05} color="#0f172a" side={THREE.BackSide} />
          <Edges color="#334155" threshold={15} opacity={0.4} transparent />
        </mesh>
        
        {result.hasNet && netX && (
          <mesh position={[netX * s, (cType.height / 2) * s, (cType.depth / 2) * s]}>
            <planeGeometry args={[0.01, cType.height * s, cType.depth * s]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.2} side={THREE.DoubleSide} wireframe />
            <Edges color="#ef4444" />
            <Text position={[0, (cType.height / 2) * s + 0.2, 0]} fontSize={0.2} color="#ef4444" fontWeight="bold">CARGO NET ACTIVE</Text>
          </mesh>
        )}

        {/* Orientation Labels */}
        <Text position={[-0.6, (cType.height / 2) * s, (cType.depth / 2) * s]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.3} color="#64748b" fontWeight="bold">1. FRONT WALL (INNERMOST)</Text>
        
        <group position={[cType.width * s, (cType.height / 2) * s, (cType.depth / 2) * s]}>
          <mesh><boxGeometry args={[0.01, cType.height * s, cType.depth * s]} /><meshBasicMaterial color="#3b82f6" transparent opacity={0.12} /></mesh>
          <Text rotation={[0, Math.PI / 2, 0]} position={[0.4, 0, 0]} fontSize={0.3} color="#3b82f6" fontWeight="bold">4. DOOR ACCESS (BACK)</Text>
        </group>

        <Text position={[(cType.width / 2) * s, (cType.height / 2) * s, (cType.depth) * s + 0.4]} rotation={[0, 0, 0]} fontSize={0.3} color="#64748b" fontWeight="bold">2. LEFT SIDE</Text>
        <Text position={[(cType.width / 2) * s, (cType.height / 2) * s, -0.4]} rotation={[0, Math.PI, 0]} fontSize={0.3} color="#64748b" fontWeight="bold">3. RIGHT SIDE</Text>

        {/* Dimension Labels */}
        <Text position={[(cType.width / 2) * s, -0.4, (cType.depth / 2) * s]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.25} color="#94a3b8">LENGTH: {(cType.width / 1000).toFixed(2)}m</Text>
        <Text position={[cType.width * s + 0.4, (cType.height / 2) * s, (cType.depth / 2) * s]} rotation={[0, Math.PI / 2, 0]} fontSize={0.25} color="#94a3b8">HEIGHT: {(cType.height / 1000).toFixed(2)}m</Text>
        <Text position={[-0.4, (cType.height / 2) * s - 0.5, (cType.depth / 2) * s]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.25} color="#94a3b8">WIDTH: {(cType.depth / 1000).toFixed(2)}m</Text>

        <Text position={[(cType.width / 2) * s, (cType.height + 600) * s, (cType.depth / 2) * s]} fontSize={0.45} color="#0f172a" fontWeight="bold">
          {CONTAINER_TYPES[result.containerType].label} — {result.packedBoxes.length} UNITS
        </Text>

        {result.packedBoxes.map(box => (
          <Box3D 
            key={box.id} 
            box={box} 
            isSelected={selectedBoxId === box.id}
            onSelect={onSelectBox}
            isManualMode={isManualMode}
            transformMode={transformMode}
            onUpdate={(id, updates) => onUpdateBox(result.containerId, id, updates)}
            allBoxes={result.packedBoxes}
            containerType={result.containerType}
            netX={netX}
          />
        ))}
      </group>
    </group>
  );
};

// --- App Hub ---

export default function App() {
  const [containers, setContainers] = useState<ContainerInstance[]>([{ id: generateId(), type: '20GP', items: [] }]);
  const [results, setResults] = useState<PackingResult[]>([]);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isPacking, setIsPacking] = useState(false);
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate'>('translate');
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [checkpoint, setCheckpoint] = useState<PackingResult[] | null>(null);
  const orbitRef = useRef<any>(null);

  const uniqueModels = useMemo(() => Array.from(new Set(MODEL_LIBRARY.map(m => m.model))), []);

  const pushToHistory = useCallback((newContainers: ContainerInstance[], newResults: PackingResult[]) => {
    const state: HistoryState = {
      containers: JSON.parse(JSON.stringify(newContainers)),
      results: JSON.parse(JSON.stringify(newResults))
    };
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(state);
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => {
      const next = prev + 1;
      return next >= 50 ? 49 : next;
    });
  }, [historyIndex]);

  const commitState = useCallback((newContainers: ContainerInstance[], newResults: PackingResult[]) => {
    setContainers(newContainers);
    setResults(newResults);
    pushToHistory(newContainers, newResults);
  }, [pushToHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const state = JSON.parse(JSON.stringify(history[prevIndex])) as HistoryState;
      setContainers(state.containers);
      setResults(state.results);
      setHistoryIndex(prevIndex);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const state = JSON.parse(JSON.stringify(history[nextIndex])) as HistoryState;
      setContainers(state.containers);
      setResults(state.results);
      setHistoryIndex(nextIndex);
    }
  }, [history, historyIndex]);

  // Initial history push
  useEffect(() => {
    if (historyIndex === -1) {
      pushToHistory(containers, results);
    }
  }, []);

  const runPacking = () => {
    setIsPacking(true);
    setSelectedBoxId(null);
    setTimeout(() => {
      const packed = packBoxesOptimized(containers);
      commitState(containers, packed);
      setIsPacking(false);
      setMode('auto');
    }, 400);
  };

  const rotateSelectedBox = useCallback(() => {
    if (!selectedBoxId || mode !== 'manual') return;
    const newResults = JSON.parse(JSON.stringify(results)) as PackingResult[];
    let changed = false;
    for (const r of newResults) {
      const boxIndex = r.packedBoxes.findIndex(b => b.id === selectedBoxId);
      if (boxIndex !== -1) {
        const box = r.packedBoxes[boxIndex];
        const dims = [box.width, box.height, box.depth];
        const perms: [number, number, number][] = [
          [dims[0], dims[2], dims[1]],
          [dims[1], dims[0], dims[2]],
          [dims[1], dims[2], dims[0]],
          [dims[2], dims[0], dims[1]],
          [dims[2], dims[1], dims[0]],
          [dims[0], dims[1], dims[2]],
        ];
        
        for (const [nw, nh, nd] of perms) {
          if (nw === box.width && nh === box.height && nd === box.depth) continue;
          const rotated = { ...box, width: nw, height: nh, depth: nd };
          const netX = r.hasNet ? r.packedBoxes.reduce((max, b) => Math.max(max, b.x + b.width), 0) + 50 : undefined;
          if (!checkCollision(rotated, r.packedBoxes, r.containerType, netX)) {
            r.packedBoxes[boxIndex] = rotated;
            changed = true;
            break;
          }
        }
      }
    }
    if (changed) commitState(containers, newResults);
  }, [selectedBoxId, mode, results, containers, commitState]);

  const deleteSelectedBox = useCallback(() => {
    if (!selectedBoxId || mode !== 'manual') return;
    const newResults = results.map(r => ({
      ...r,
      packedBoxes: r.packedBoxes.filter(b => b.id !== selectedBoxId)
    }));
    commitState(containers, newResults);
    setSelectedBoxId(null);
  }, [selectedBoxId, mode, results, containers, commitState]);

  const moveSelectedBox = useCallback((direction: string) => {
    if (mode !== 'manual') return;
    
    if (!selectedBoxId) {
      // Camera panning if no box selected
      const step = 0.5;
      if (orbitRef.current) {
        const controls = orbitRef.current;
        if (direction === 'w') controls.target.x -= step;
        if (direction === 's') controls.target.x += step;
        if (direction === 'a') controls.target.z += step;
        if (direction === 'd') controls.target.z -= step;
        if (direction === 'q') controls.object.position.y += step;
        if (direction === 'e') controls.object.position.y -= step;
        controls.update();
      }
      return;
    }

    const step = 50; // 50mm steps
    const newResults = JSON.parse(JSON.stringify(results)) as PackingResult[];
    let changed = false;
    for (const r of newResults) {
      const boxIndex = r.packedBoxes.findIndex(b => b.id === selectedBoxId);
      if (boxIndex !== -1) {
        const box = r.packedBoxes[boxIndex];
        let next = { ...box };
        if (direction === 'arrowup') next.y += step;
        if (direction === 'arrowdown') next.y -= step;
        if (direction === 'arrowleft') next.z += step;
        if (direction === 'arrowright') next.z -= step;
        if (direction === 'w') next.x -= step;
        if (direction === 's') next.x += step;

        const netX = r.hasNet ? r.packedBoxes.reduce((max, b) => Math.max(max, b.x + b.width), 0) + 50 : undefined;
        if (!checkCollision(next, r.packedBoxes, r.containerType, netX)) {
          r.packedBoxes[boxIndex] = next;
          changed = true;
        }
      }
    }
    if (changed) commitState(containers, newResults);
  }, [selectedBoxId, mode, results, containers, commitState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (isCtrl && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      } else if (isCtrl && key === 'y') {
        e.preventDefault();
        redo();
      } else if (key === 'r') {
        if (mode === 'manual' && selectedBoxId) {
          setTransformMode(prev => prev === 'translate' ? 'rotate' : 'translate');
        }
      } else if (key === 't') {
        if (mode === 'manual' && selectedBoxId) {
          rotateSelectedBox();
        }
      } else if (key === 'delete' || key === 'backspace') {
        if (mode === 'manual' && selectedBoxId) {
          e.preventDefault();
          deleteSelectedBox();
        }
      } else if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 's', 'a', 'd', 'q', 'e'].includes(key)) {
        if (mode === 'manual') {
          e.preventDefault();
          moveSelectedBox(key);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, rotateSelectedBox, deleteSelectedBox, moveSelectedBox, mode, selectedBoxId]);

  const saveCheckpoint = () => {
    setCheckpoint(JSON.parse(JSON.stringify(results)));
    alert("Checkpoint saved!");
  };

  const loadCheckpoint = () => {
    if (checkpoint) {
      commitState(containers, JSON.parse(JSON.stringify(checkpoint)));
    }
  };

  const toggleNet = (containerId: string) => {
    const next = results.map(r => r.containerId === containerId ? { ...r, hasNet: !r.hasNet } : r);
    const nextContainers = containers.map(c => c.id === containerId ? { ...c, hasNet: !c.hasNet } : c);
    commitState(nextContainers, next);
  };

  const onUpdateBox = useCallback((containerId: string, boxId: string, updates: Partial<PackedBox>) => {
    const next = results.map(r => {
      if (r.containerId === containerId) {
        return {
          ...r,
          packedBoxes: r.packedBoxes.map(b => b.id === boxId ? { ...b, ...updates } : b)
        };
      }
      return r;
    });
    commitState(containers, next);
  }, [results, containers, commitState]);

  const addContainer = () => commitState([...containers, { id: generateId(), type: '20GP', items: [] }], results);
  const removeContainer = (id: string) => commitState(containers.filter(c => c.id !== id), results.filter(r => r.containerId !== id));
  const addCargoItem = (containerId: string) => {
    const next = containers.map(c => c.id === containerId ? { ...c, items: [...c.items, { id: generateId(), model: uniqueModels[0], size: '', qty: 50, color: COLORS[c.items.length % COLORS.length] }] } : c);
    commitState(next, results);
  };
  const updateCargoItem = (containerId: string, itemId: string, updates: Partial<CargoItem>) => {
    const next = containers.map(c => c.id === containerId ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, ...updates } : i) } : c);
    commitState(next, results);
  };
  const removeCargoItem = (containerId: string, itemId: string) => {
    const next = containers.map(c => c.id === containerId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c);
    commitState(next, results);
  };
  const moveCargoItem = (containerId: string, index: number, direction: 'up' | 'down') => {
    const next = containers.map(c => {
      if (c.id === containerId) {
        const newItems = [...c.items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < newItems.length) { [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]]; }
        return { ...c, items: newItems };
      }
      return c;
    });
    commitState(next, results);
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', background: '#f8fafc' }}>
      <div style={{ width: '460px', height: '100%', background: '#fff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '24px', boxShadow: '4px 0 20px rgba(0,0,0,0.02)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
          <div style={{ background: '#000', padding: '10px', borderRadius: '12px' }}><LucideTruck size={24} color="#fff" /></div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 950, color: '#000' }}>Millinks Space Logic AI</h1>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <LucideShieldCheck size={10} color="#10b981" fill="#10b981" />
              <span style={{ fontSize: '0.6rem', color: '#000', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Density: Tier-Optimized</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
              <span style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Labels 1-4 indicate stuffing sequence</span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '24px', paddingRight: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h2 style={{ margin: 0, fontSize: '0.65rem', fontWeight: 950, color: '#000', textTransform: 'uppercase' }}>Fleet Setup</h2>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={undo} disabled={historyIndex <= 0} className="btn-secondary" title="Undo (Ctrl+Z)"><LucideUndo size={14} /></button>
              <button onClick={redo} disabled={historyIndex >= history.length - 1} className="btn-secondary" title="Redo (Ctrl+Y)"><LucideRedo size={14} /></button>
              <button onClick={addContainer} className="btn-secondary"><LucidePlus size={14} /> Add Unit</button>
            </div>
          </div>
          {containers.map((c, ci) => (
            <div key={c.id} className="container-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className="badge">#{ci + 1}</span>
                  <select className="select-sm" value={c.type} onChange={e => setContainers(containers.map(x => x.id === c.id ? { ...x, type: e.target.value as any } : x))}>
                    {Object.entries(CONTAINER_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => toggleNet(c.id)} className={`btn-icon ${c.hasNet ? 'active' : ''}`} title="Toggle Cargo Net"><LucideNet size={14} /></button>
                  <button onClick={() => removeContainer(c.id)} className="btn-icon-danger"><LucideTrash2 size={14} /></button>
                </div>
              </div>
              {c.items.map((item, idx) => (
                <div key={item.id} className="cargo-row">
                  <div className="reorder-controls">
                    <button onClick={() => moveCargoItem(c.id, idx, 'up')} disabled={idx === 0} className="reorder-btn"><LucideChevronUp size={12} /></button>
                    <button onClick={() => moveCargoItem(c.id, idx, 'down')} disabled={idx === c.items.length - 1} className="reorder-btn"><LucideChevronDown size={12} /></button>
                  </div>
                  <div className="input-field"><label>Model</label>
                    <select value={item.model} onChange={e => updateCargoItem(c.id, item.id, { model: e.target.value, size: '' })}>
                      {uniqueModels.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="input-field"><label>Size</label>
                    <select value={item.size} onChange={e => updateCargoItem(c.id, item.id, { size: e.target.value })}>
                      <option value="">--</option>
                      {MODEL_LIBRARY.filter(m => m.model === item.model).map(m => <option key={m.size} value={m.size}>{m.size}"</option>)}
                    </select>
                  </div>
                  <div className="input-field" style={{ width: '45px' }}><label>Qty</label><input type="number" min="1" value={item.qty} onChange={e => updateCargoItem(c.id, item.id, { qty: parseInt(e.target.value) || 1 })} /></div>
                  <div className="input-field" style={{ width: '25px' }}><label><LucidePalette size={10} /></label><input type="color" value={item.color} className="color-input" onChange={e => updateCargoItem(c.id, item.id, { color: e.target.value })} /></div>
                  <button onClick={() => removeCargoItem(c.id, item.id)} className="btn-icon-danger" style={{ marginTop: '14px' }}><LucideTrash2 size={14} /></button>
                </div>
              ))}
              <button onClick={() => addCargoItem(c.id)} className="btn-ghost-full"><LucidePlus size={14} /> New Cargo Row</button>
            </div>
          ))}
        </div>

        <button onClick={runPacking} disabled={isPacking} className="btn-primary">
          {isPacking ? <LucideRotateCw className="animate-spin" size={20} /> : <LucideMaximize size={20} />}
          {isPacking ? 'Solving Matrix...' : 'Apply Density Solver'}
        </button>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 20, display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => { setMode('auto'); setSelectedBoxId(null); }} 
            className={`mode-btn ${mode === 'auto' ? 'active' : ''}`}
            title="View Mode"
          >
            <LucidePointer size={20} />
          </button>
          <button 
            onClick={() => setMode('manual')} 
            className={`mode-btn ${mode === 'manual' ? 'active' : ''}`}
            title="Manual Adjust (Hand Mode)"
          >
            <LucideHand size={20} />
          </button>
          <div style={{ width: '1px', background: '#e2e8f0', margin: '0 5px' }} />
          <button onClick={saveCheckpoint} className="mode-btn" title="Save Checkpoint"><LucideSave size={20} /></button>
          <button onClick={loadCheckpoint} disabled={!checkpoint} className="mode-btn" title="Restore Checkpoint"><LucideUndo size={20} /></button>
          <div style={{ width: '1px', background: '#e2e8f0', margin: '0 5px' }} />
          <button onClick={undo} disabled={historyIndex <= 0} className="mode-btn" title="Undo (Ctrl+Z)"><LucideUndo size={20} /></button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="mode-btn" title="Redo (Ctrl+Y)"><LucideRedo size={20} /></button>
          {selectedBoxId && mode === 'manual' && (
            <>
              <div style={{ width: '1px', background: '#e2e8f0', margin: '0 5px' }} />
              <button 
                onClick={() => setTransformMode(prev => prev === 'translate' ? 'rotate' : 'translate')} 
                className={`mode-btn ${transformMode === 'rotate' ? 'active' : ''}`} 
                title="Toggle Translate/Rotate (R)"
              >
                <LucideRotateCw size={20} />
              </button>
              <button onClick={rotateSelectedBox} className="mode-btn" title="Auto-Rotate (T)"><LucideCompass size={20} /></button>
              <button onClick={deleteSelectedBox} className="mode-btn-danger" title="Delete (Del)"><LucideTrash2 size={20} /></button>
            </>
          )}
        </div>

        <Canvas shadows gl={{ antialias: true }} onPointerMissed={() => setSelectedBoxId(null)}>
          <color attach="background" args={['#f8fafc']} />
          <PerspectiveCamera makeDefault position={[25, 20, 25]} fov={22} />
          <OrbitControls ref={orbitRef} makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.05} enabled={!selectedBoxId} keyEvents={true} />
          <ambientLight intensity={3.5} />
          <directionalLight position={[40, 80, 40]} intensity={1.5} castShadow />
          <pointLight position={[-50, 40, -50]} intensity={0.5} color="#dbeafe" />
          <Grid infiniteGrid cellSize={1} sectionSize={5} sectionColor="#cbd5e1" cellColor="#e2e8f0" fadeDistance={250} />
          <group>
            {results.map((result, idx) => (
              <Container3D 
                key={result.containerId} 
                result={result} 
                offset={[0, 0, idx * 18]} 
                selectedBoxId={selectedBoxId}
                onSelectBox={setSelectedBoxId}
                isManualMode={mode === 'manual'}
                transformMode={transformMode}
                onUpdateBox={onUpdateBox}
              />
            ))}
          </group>
        </Canvas>

        {results.length > 0 && (
          <div className="analytic-overlay">
            <h3 className="overlay-title"><LucideSettings2 size={14} style={{ marginRight: '8px' }} />Logistics Report</h3>
            {results.map(r => (
              <div key={r.containerId} className="result-stat">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><LucideCheckCircle size={14} color="#10b981" /><span style={{ fontSize: '0.8rem', fontWeight: 950, color: '#000' }}>{r.containerType} UNIT</span></div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 950, color: '#000' }}>{Math.round((r.packedVolume / r.totalVolume) * 1000) / 10}% Dense</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${(r.packedVolume / r.totalVolume) * 100}%` }} /></div>
                <div className="stats-grid"><div className="stat-pill">Units: <strong>{r.packedBoxes.length}</strong></div><div className="stat-pill"><LucideLayers size={10} /> Tier Mode</div></div>
                {r.unfitItems.length > 0 && (
                  <div className="unfit-list">
                    <div className="unfit-header"><LucideAlertTriangle size={14} /><span>Surplus Inventory:</span></div>
                    {r.unfitItems.map((u, i) => <div key={i} className="unfit-item">• {u.model} {u.size}": {u.count} unfit</div>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .mode-btn { background: #fff; border: 1px solid #e2e8f0; color: #64748b; padding: 12px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .mode-btn.active { background: #000; color: #fff; border-color: #000; }
        .mode-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .mode-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .mode-btn-danger { background: #fff; border: 1px solid #fee2e2; color: #ef4444; padding: 12px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .mode-btn-danger:hover { background: #ef4444; color: #fff; transform: translateY(-2px); }
        .btn-icon { background: transparent; border: 1px solid #e2e8f0; color: #cbd5e1; cursor: pointer; padding: 4px; border-radius: 6px; transition: all 0.2s; }
        .btn-icon.active { background: #ef4444; color: #fff; border-color: #ef4444; }
        .section-config { background: #f1f5f9; padding: 16px; border-radius: 14px; border: 1px solid #e2e8f0; }
        .container-card { background: #f8fafc; padding: 14px; border-radius: 12px; margin-bottom: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .cargo-row { display: grid; grid-template-columns: 24px 1fr 1fr 45px 25px 24px; gap: 6px; margin-bottom: 10px; align-items: center; }
        .reorder-controls { display: flex; flex-direction: column; gap: 1px; margin-top: 14px; }
        .reorder-btn { background: #fff; border: 1px solid #e2e8f0; color: #000; padding: 1px; border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .reorder-btn:disabled { opacity: 0.1; cursor: not-allowed; }
        .input-field { display: flex; flex-direction: column; gap: 3px; }
        .input-field label { font-size: 0.45rem; font-weight: 950; color: #000; text-transform: uppercase; letter-spacing: 0.08em; }
        .input-field select, .input-field input { padding: 4px 6px; border-radius: 5px; border: 1px solid #cbd5e1; font-size: 0.7rem; background: #fff; font-weight: 800; outline: none; color: #000; }
        .color-input { padding: 1px !important; height: 24px; cursor: pointer; border: 1px solid #cbd5e1; border-radius: 3px; }
        .badge { font-size: 0.55rem; font-weight: 950; color: #000; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; }
        .btn-primary { padding: 16px; border-radius: 12px; border: none; background: #000; color: #fff; font-weight: 950; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.8rem; box-shadow: 0 10px 20px -5px rgba(0,0,0,0.2); }
        .btn-secondary { padding: 4px 10px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; color: #000; font-size: 0.65rem; font-weight: 950; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        .btn-ghost-full { width: 100%; padding: 8px; border-radius: 8px; border: 1.5px dashed #e2e8f0; background: transparent; color: #000; font-size: 0.68rem; font-weight: 950; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-icon-danger { background: transparent; border: none; color: #cbd5e1; cursor: pointer; padding: 4px; }
        .btn-icon-danger:hover { color: #ef4444; }
        .analytic-overlay { position: absolute; bottom: 24px; right: 24px; background: rgba(255, 255, 255, 0.98); padding: 24px; border-radius: 20px; backdrop-filter: blur(20px); border: 1px solid #e2e8f0; box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1); width: 350px; max-height: 80vh; overflow-y: auto; }
        .overlay-title { margin: 0 0 16px 0; font-size: 0.7rem; font-weight: 950; color: #000; text-transform: uppercase; letter-spacing: 0.12em; display: flex; align-items: center; }
        .result-stat { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9; }
        .progress-bar { height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; margin: 10px 0; border: 1px solid #e2e8f0; }
        .progress-fill { height: 100%; background: #000; transition: width 1.2s ease-out; }
        .stats-grid { display: flex; gap: 8px; margin-top: 12px; }
        .stat-pill { background: #f8fafc; padding: 5px 8px; border-radius: 6px; font-size: 0.68rem; color: #000; font-weight: 800; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 4px; }
        .stat-pill strong { color: #000; }
        .unfit-list { margin-top: 14px; background: #fef2f2; padding: 10px; border-radius: 10px; font-size: 0.7rem; color: #b91c1c; border: 1px solid #fee2e2; }
        .unfit-header { display: flex; gap: 6px; align-items: center; font-weight: 950; text-transform: uppercase; margin-bottom: 6px; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
