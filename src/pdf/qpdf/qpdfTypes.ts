import type {
  PdfInput,
  PageSelection,
  MergeSource,
  SplitOptions as PdfStudioSplitOptions,
  RotateOptions as PdfStudioRotateOptions,
  ExtractPagesOptions as PdfStudioExtractPagesOptions,
  DeletePagesOptions as PdfStudioDeletePagesOptions,
  LockOptions as PdfStudioLockOptions,
  UnlockOptions as PdfStudioUnlockOptions,
  CompressOptions as PdfStudioCompressOptions,
  FlattenOptions as PdfStudioFlattenOptions,
  Permissions,
  PrintPermission,
  ModifyPermission,
  PdfInfo,
} from 'pdfstudio';

export type {
  PdfInput,
  PageSelection,
  MergeSource,
  PdfStudioSplitOptions as SplitOptions,
  PdfStudioRotateOptions as RotateOptions,
  PdfStudioExtractPagesOptions as ExtractPagesOptions,
  PdfStudioDeletePagesOptions as DeletePagesOptions,
  PdfStudioLockOptions as LockOptions,
  PdfStudioUnlockOptions as UnlockOptions,
  PdfStudioCompressOptions as CompressOptions,
  PdfStudioFlattenOptions as FlattenOptions,
  Permissions,
  PrintPermission,
  ModifyPermission,
  PdfInfo,
};

export interface QpdfEngineProgress {
  (percentage: number, status?: string): void;
}
