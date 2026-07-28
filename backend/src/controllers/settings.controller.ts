import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

export const getSettings = async (req: Request, res: Response) => {
  try {
    const zone = await prisma.campusZone.findFirst();

    let centerLat = 12.9337;
    let centerLng = 77.6051;

    if (zone && zone.polygonData && (zone.polygonData as any).coordinates) {
      const coords = (zone.polygonData as any).coordinates[0];
      if (coords && coords.length > 0) {
        centerLng = coords[0][0];
        centerLat = coords[0][1];
      }
    }

    return res.json({
      zoneName: zone ? zone.name : 'Main Campus Zone',
      centerLat,
      centerLng,
      geofenceRadiusMeters: 500,
      autoCheckInEnabled: true,
      gpsPingIntervalSeconds: 3,
      lowBatteryThreshold: 20,
      systemNotifications: true,
      timescaleRetentionDays: 90
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({ message: 'Server error fetching settings' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  const { zoneName, centerLat, centerLng, geofenceRadiusMeters, gpsPingIntervalSeconds, timescaleRetentionDays } = req.body;

  try {
    const lat = centerLat ? parseFloat(centerLat) : 12.9337;
    const lng = centerLng ? parseFloat(centerLng) : 77.6051;

    const delta = (geofenceRadiusMeters ? parseFloat(geofenceRadiusMeters) : 500) / 111000;

    const newPolygonData = {
      type: 'Polygon',
      coordinates: [
        [
          [lng - delta, lat - delta],
          [lng - delta, lat + delta],
          [lng + delta, lat + delta],
          [lng + delta, lat - delta],
          [lng - delta, lat - delta]
        ]
      ]
    };

    const zone = await prisma.campusZone.findFirst();
    if (zone) {
      await prisma.campusZone.update({
        where: { id: zone.id },
        data: {
          name: zoneName || zone.name,
          polygonData: newPolygonData
        }
      });
    } else {
      await prisma.campusZone.create({
        data: {
          name: zoneName || 'Main Campus Zone',
          polygonData: newPolygonData
        }
      });
    }

    return res.json({
      message: 'Settings updated successfully for coordinates: ' + lat + '° N, ' + lng + '° E',
      settings: {
        zoneName,
        centerLat: lat,
        centerLng: lng,
        geofenceRadiusMeters,
        gpsPingIntervalSeconds,
        timescaleRetentionDays
      }
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return res.status(500).json({ message: 'Server error updating settings' });
  }
};
