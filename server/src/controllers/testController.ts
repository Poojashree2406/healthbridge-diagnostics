import { Request, Response } from 'express';
import { Test } from '../models/Test';
import { TestCategory } from '../models/TestCategory';
import { TestPackage } from '../models/TestPackage';

// Server-side in-memory cache (5 min) for catalog & category lists
const serverCache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getCache(key: string) {
  const hit = serverCache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL) return hit.data;
  return null;
}
function setCache(key: string, data: any) {
  serverCache.set(key, { data, ts: Date.now() });
}
export function invalidateTestCache() {
  serverCache.clear();
}

export const getTests = async (req: Request, res: Response) => {
  try {
    const { category, search, minPrice, maxPrice, homeCollection, fasting } = req.query;

    // Only cache unfiltered requests
    const isFiltered = category || search || minPrice || maxPrice || homeCollection || fasting;
    const cacheKey = isFiltered ? null : 'all_tests';
    if (cacheKey) {
      const cached = getCache(cacheKey);
      if (cached) {
        res.set('Cache-Control', 'public, max-age=300');
        return res.json(cached);
      }
    }

    const query: any = { active: true };

    if (category) {
      const catObj = await TestCategory.findOne({ slug: category }).lean();
      if (catObj) query.categoryId = catObj._id;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (homeCollection === 'true') query.homeCollectionAvailable = true;
    if (fasting === 'true') query.fastingRequired = true;

    const tests = await Test.find(query)
      .populate('categoryId', 'name slug iconName')
      .lean();

    const response = { success: true, count: tests.length, tests };
    if (cacheKey) setCache(cacheKey, response);

    res.set('Cache-Control', isFiltered ? 'private, max-age=60' : 'public, max-age=300');
    return res.json(response);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getTestCategories = async (req: Request, res: Response) => {
  try {
    const cached = getCache('categories');
    if (cached) {
      res.set('Cache-Control', 'public, max-age=600');
      return res.json(cached);
    }
    const categories = await TestCategory.find({ active: true }).lean();
    const response = { success: true, categories };
    setCache('categories', response);
    res.set('Cache-Control', 'public, max-age=600');
    return res.json(response);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getTestPackages = async (req: Request, res: Response) => {
  try {
    const cached = getCache('packages');
    if (cached) {
      res.set('Cache-Control', 'public, max-age=300');
      return res.json(cached);
    }
    const packages = await TestPackage.find({ active: true })
      .populate('testIds', 'name code price')
      .lean();
    const response = { success: true, packages };
    setCache('packages', response);
    res.set('Cache-Control', 'public, max-age=300');
    return res.json(response);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getTestById = async (req: Request, res: Response) => {
  try {
    const cacheKey = `test_${req.params.id}`;
    const cached = getCache(cacheKey);
    if (cached) {
      res.set('Cache-Control', 'public, max-age=300');
      return res.json(cached);
    }
    const test = await Test.findById(req.params.id)
      .populate('categoryId', 'name slug iconName')
      .lean();
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }
    const response = { success: true, test };
    setCache(cacheKey, response);
    res.set('Cache-Control', 'public, max-age=300');
    return res.json(response);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createTest = async (req: Request, res: Response) => {
  try {
    const test = await Test.create(req.body);
    invalidateTestCache();
    return res.status(201).json({ success: true, test });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const updateTest = async (req: Request, res: Response) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true });
    invalidateTestCache();
    return res.json({ success: true, test });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteTest = async (req: Request, res: Response) => {
  try {
    await Test.findByIdAndUpdate(req.params.id, { active: false });
    invalidateTestCache();
    return res.json({ success: true, message: 'Test deactivated successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
