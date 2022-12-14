import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import * as InvokeAI from '../../app/invokeai';
import promptToString from '../../common/util/promptToString';
import { seedWeightsToString } from '../../common/util/seedWeightPairs';
import { FACETOOL_TYPES } from '../../app/constants';
import { InvokeTabName, tabMap } from '../tabs/InvokeTabs';

export type UpscalingLevel = 2 | 4;

export type FacetoolType = typeof FACETOOL_TYPES[number];

export interface OptionsState {
  prompt: string;
  iterations: number;
  steps: number;
  cfgScale: number;
  height: number;
  width: number;
  sampler: string;
  threshold: number;
  perlin: number;
  seed: number;
  img2imgStrength: number;
  facetoolType: FacetoolType;
  facetoolStrength: number;
  codeformerFidelity: number;
  upscalingLevel: UpscalingLevel;
  upscalingStrength: number;
  initialImage?: InvokeAI.Image | string; // can be an Image or url
  maskPath: string;
  seamless: boolean;
  hiresFix: boolean;
  shouldFitToWidthHeight: boolean;
  shouldGenerateVariations: boolean;
  variationAmount: number;
  seedWeights: string;
  shouldRunESRGAN: boolean;
  shouldRunFacetool: boolean;
  shouldRandomizeSeed: boolean;
  showAdvancedOptions: boolean;
  activeTab: number;
  shouldShowImageDetails: boolean;
  showDualDisplay: boolean;
  shouldShowOptionsPanel: boolean;
  shouldPinOptionsPanel: boolean;
  optionsPanelScrollPosition: number;
  shouldHoldOptionsPanelOpen: boolean;
  shouldLoopback: boolean;
}

const initialOptionsState: OptionsState = {
  prompt: '',
  iterations: 1,
  steps: 50,
  cfgScale: 7.5,
  height: 512,
  width: 512,
  sampler: 'k_lms',
  threshold: 0,
  perlin: 0,
  seed: 0,
  seamless: false,
  hiresFix: false,
  img2imgStrength: 0.75,
  maskPath: '',
  shouldFitToWidthHeight: true,
  shouldGenerateVariations: false,
  variationAmount: 0.1,
  seedWeights: '',
  shouldRunESRGAN: false,
  upscalingLevel: 4,
  upscalingStrength: 0.75,
  shouldRunFacetool: false,
  facetoolStrength: 0.8,
  facetoolType: 'gfpgan',
  codeformerFidelity: 0.75,
  shouldRandomizeSeed: true,
  showAdvancedOptions: true,
  activeTab: 0,
  shouldShowImageDetails: false,
  showDualDisplay: true,
  shouldShowOptionsPanel: true,
  shouldPinOptionsPanel: true,
  optionsPanelScrollPosition: 0,
  shouldHoldOptionsPanelOpen: false,
  shouldLoopback: false,
};

const initialState: OptionsState = initialOptionsState;

export const optionsSlice = createSlice({
  name: 'options',
  initialState,
  reducers: {
    setPrompt: (state, action: PayloadAction<string | InvokeAI.Prompt>) => {
      const newPrompt = action.payload;
      if (typeof newPrompt === 'string') {
        state.prompt = newPrompt;
      } else {
        state.prompt = promptToString(newPrompt);
      }
    },
    setIterations: (state, action: PayloadAction<number>) => {
      state.iterations = action.payload;
    },
    setSteps: (state, action: PayloadAction<number>) => {
      state.steps = action.payload;
    },
    setCfgScale: (state, action: PayloadAction<number>) => {
      state.cfgScale = action.payload;
    },
    setThreshold: (state, action: PayloadAction<number>) => {
      state.threshold = action.payload;
    },
    setPerlin: (state, action: PayloadAction<number>) => {
      state.perlin = action.payload;
    },
    setHeight: (state, action: PayloadAction<number>) => {
      state.height = action.payload;
    },
    setWidth: (state, action: PayloadAction<number>) => {
      state.width = action.payload;
    },
    setSampler: (state, action: PayloadAction<string>) => {
      state.sampler = action.payload;
    },
    setSeed: (state, action: PayloadAction<number>) => {
      state.seed = action.payload;
      state.shouldRandomizeSeed = false;
    },
    setImg2imgStrength: (state, action: PayloadAction<number>) => {
      state.img2imgStrength = action.payload;
    },
    setFacetoolStrength: (state, action: PayloadAction<number>) => {
      state.facetoolStrength = action.payload;
    },
    setCodeformerFidelity: (state, action: PayloadAction<number>) => {
      state.codeformerFidelity = action.payload;
    },
    setUpscalingLevel: (state, action: PayloadAction<UpscalingLevel>) => {
      state.upscalingLevel = action.payload;
    },
    setUpscalingStrength: (state, action: PayloadAction<number>) => {
      state.upscalingStrength = action.payload;
    },
    setMaskPath: (state, action: PayloadAction<string>) => {
      state.maskPath = action.payload;
    },
    setSeamless: (state, action: PayloadAction<boolean>) => {
      state.seamless = action.payload;
    },
    setHiresFix: (state, action: PayloadAction<boolean>) => {
      state.hiresFix = action.payload;
    },
    setShouldFitToWidthHeight: (state, action: PayloadAction<boolean>) => {
      state.shouldFitToWidthHeight = action.payload;
    },
    resetSeed: (state) => {
      state.seed = -1;
    },
    setParameter: (
      state,
      action: PayloadAction<{ key: string; value: string | number | boolean }>
    ) => {
      // TODO: This probably needs to be refactored.
      const { key, value } = action.payload;
      const temp = { ...state, [key]: value };
      if (key === 'seed') {
        temp.shouldRandomizeSeed = false;
      }
      return temp;
    },
    setShouldGenerateVariations: (state, action: PayloadAction<boolean>) => {
      state.shouldGenerateVariations = action.payload;
    },
    setVariationAmount: (state, action: PayloadAction<number>) => {
      state.variationAmount = action.payload;
    },
    setSeedWeights: (state, action: PayloadAction<string>) => {
      state.seedWeights = action.payload;
    },
    setAllTextToImageParameters: (
      state,
      action: PayloadAction<InvokeAI.Metadata>
    ) => {
      const {
        sampler,
        prompt,
        seed,
        variations,
        steps,
        cfg_scale,
        threshold,
        perlin,
        seamless,
        hires_fix,
        width,
        height,
      } = action.payload.image;

      if (variations && variations.length > 0) {
        state.seedWeights = seedWeightsToString(variations);
        state.shouldGenerateVariations = true;
      } else {
        state.shouldGenerateVariations = false;
      }

      if (seed) {
        state.seed = seed;
        state.shouldRandomizeSeed = false;
      }

      if (prompt) state.prompt = promptToString(prompt);
      if (sampler) state.sampler = sampler;
      if (steps) state.steps = steps;
      if (cfg_scale) state.cfgScale = cfg_scale;
      if (threshold) state.threshold = threshold;
      if (typeof threshold === 'undefined') state.threshold = 0;
      if (perlin) state.perlin = perlin;
      if (typeof perlin === 'undefined') state.perlin = 0;
      if (typeof seamless === 'boolean') state.seamless = seamless;
      if (typeof hires_fix === 'boolean') state.hiresFix = hires_fix;
      if (width) state.width = width;
      if (height) state.height = height;
    },
    setAllImageToImageParameters: (
      state,
      action: PayloadAction<InvokeAI.Metadata>
    ) => {
      const { type, strength, fit, init_image_path, mask_image_path } =
        action.payload.image;

      if (type === 'img2img') {
        if (init_image_path) state.initialImage = init_image_path;
        if (mask_image_path) state.maskPath = mask_image_path;
        if (strength) state.img2imgStrength = strength;
        if (typeof fit === 'boolean') state.shouldFitToWidthHeight = fit;
      }
    },
    setAllParameters: (state, action: PayloadAction<InvokeAI.Metadata>) => {
      const {
        type,
        sampler,
        prompt,
        seed,
        variations,
        steps,
        cfg_scale,
        threshold,
        perlin,
        seamless,
        hires_fix,
        width,
        height,
        strength,
        fit,
        init_image_path,
        mask_image_path,
      } = action.payload.image;

      if (type === 'img2img') {
        if (init_image_path) state.initialImage = init_image_path;
        if (mask_image_path) state.maskPath = mask_image_path;
        if (strength) state.img2imgStrength = strength;
        if (typeof fit === 'boolean') state.shouldFitToWidthHeight = fit;
      }

      if (variations && variations.length > 0) {
        state.seedWeights = seedWeightsToString(variations);
        state.shouldGenerateVariations = true;
      } else {
        state.shouldGenerateVariations = false;
      }

      if (seed) {
        state.seed = seed;
        state.shouldRandomizeSeed = false;
      }

      if (prompt) state.prompt = promptToString(prompt);
      if (sampler) state.sampler = sampler;
      if (steps) state.steps = steps;
      if (cfg_scale) state.cfgScale = cfg_scale;
      if (threshold) state.threshold = threshold;
      if (typeof threshold === 'undefined') state.threshold = 0;
      if (perlin) state.perlin = perlin;
      if (typeof perlin === 'undefined') state.perlin = 0;
      if (typeof seamless === 'boolean') state.seamless = seamless;
      if (typeof hires_fix === 'boolean') state.hiresFix = hires_fix;
      if (width) state.width = width;
      if (height) state.height = height;
    },
    resetOptionsState: (state) => {
      return {
        ...state,
        ...initialOptionsState,
      };
    },
    setShouldRunFacetool: (state, action: PayloadAction<boolean>) => {
      state.shouldRunFacetool = action.payload;
    },
    setFacetoolType: (state, action: PayloadAction<FacetoolType>) => {
      state.facetoolType = action.payload;
    },
    setShouldRunESRGAN: (state, action: PayloadAction<boolean>) => {
      state.shouldRunESRGAN = action.payload;
    },
    setShouldRandomizeSeed: (state, action: PayloadAction<boolean>) => {
      state.shouldRandomizeSeed = action.payload;
    },
    setShowAdvancedOptions: (state, action: PayloadAction<boolean>) => {
      state.showAdvancedOptions = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<number | InvokeTabName>) => {
      if (typeof action.payload === 'number') {
        state.activeTab = action.payload;
      } else {
        state.activeTab = tabMap.indexOf(action.payload);
      }
    },
    setShouldShowImageDetails: (state, action: PayloadAction<boolean>) => {
      state.shouldShowImageDetails = action.payload;
    },
    setShowDualDisplay: (state, action: PayloadAction<boolean>) => {
      state.showDualDisplay = action.payload;
    },
    setInitialImage: (
      state,
      action: PayloadAction<InvokeAI.Image | string>
    ) => {
      state.initialImage = action.payload;
    },
    clearInitialImage: (state) => {
      state.initialImage = undefined;
    },
    setShouldPinOptionsPanel: (state, action: PayloadAction<boolean>) => {
      state.shouldPinOptionsPanel = action.payload;
    },
    setShouldShowOptionsPanel: (state, action: PayloadAction<boolean>) => {
      state.shouldShowOptionsPanel = action.payload;
    },
    setOptionsPanelScrollPosition: (state, action: PayloadAction<number>) => {
      state.optionsPanelScrollPosition = action.payload;
    },
    setShouldHoldOptionsPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.shouldHoldOptionsPanelOpen = action.payload;
    },
    setShouldLoopback: (state, action: PayloadAction<boolean>) => {
      state.shouldLoopback = action.payload;
    },
  },
});

export const {
  setPrompt,
  setIterations,
  setSteps,
  setCfgScale,
  setThreshold,
  setPerlin,
  setHeight,
  setWidth,
  setSampler,
  setSeed,
  setSeamless,
  setHiresFix,
  setImg2imgStrength,
  setFacetoolStrength,
  setFacetoolType,
  setCodeformerFidelity,
  setUpscalingLevel,
  setUpscalingStrength,
  setMaskPath,
  resetSeed,
  resetOptionsState,
  setShouldFitToWidthHeight,
  setParameter,
  setShouldGenerateVariations,
  setSeedWeights,
  setVariationAmount,
  setAllParameters,
  setShouldRunFacetool,
  setShouldRunESRGAN,
  setShouldRandomizeSeed,
  setShowAdvancedOptions,
  setActiveTab,
  setShouldShowImageDetails,
  setAllTextToImageParameters,
  setAllImageToImageParameters,
  setShowDualDisplay,
  setInitialImage,
  clearInitialImage,
  setShouldShowOptionsPanel,
  setShouldPinOptionsPanel,
  setOptionsPanelScrollPosition,
  setShouldHoldOptionsPanelOpen,
  setShouldLoopback,
} = optionsSlice.actions;

export default optionsSlice.reducer;
