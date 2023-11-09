export type LocalityType = {
  slug: string;
  robotCapacity: number;
  timestamps: number[][];
  landmarks: number[];
  depotLandmark: number;
};

export type LocalityRetrieve = LocalityType;

export type LandmarksList = {
  uuid: string;
  name: string;
  description?: string | null;
  tag: number;
  floor: number;
  mapId: string;
  extraFields: {
    [key: string]: string | boolean | number;
  };
};
