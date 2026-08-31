/**
 * Data contracts for the Thesis Management System.
 * (JSDoc typedefs — the Base44 workspace runs JSX, so these document the
 *  shapes that will become TS interfaces when migrated to the Django backend.)
 */

/** @typedef {"draft"|"submitted"|"under_review"|"approved"|"published"|"rejected"} ThesisStatus */

export const THESIS_STATUS = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under_review",
  APPROVED: "approved",
  PUBLISHED: "published",
  REJECTED: "rejected",
};

export const STATUS_LABELS = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  approved: "Approved",
  published: "Published",
  rejected: "Rejected",
};

/** Map of status -> tailwind classes for badges. */
export const STATUS_STYLES = {
  draft: "bg-muted text-muted-foreground border-border",
  submitted:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
  under_review:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  approved:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  published: "bg-primary/10 text-primary border-primary/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

/**
 * @typedef {Object} Institution
 * @property {string} id
 * @property {string} name
 * @property {string} code
 * @property {string} country
 * @property {string} [website]
 * @property {boolean} active
 */

/**
 * @typedef {Object} Department
 * @property {string} id
 * @property {string} name
 * @property {string} code
 * @property {string} institutionId
 * @property {string} [driveFolderLink]
 * @property {boolean} active
 */

/**
 * @typedef {Object} ThesisCategory
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string|null} parentId
 */

/**
 * @typedef {Object} Thesis
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string} abstract
 * @property {string[]} keywords
 * @property {string} author
 * @property {string} supervisor
 * @property {string[]} coSupervisors
 * @property {string} institutionId
 * @property {string} departmentId
 * @property {string} categoryId
 * @property {string} publicationDate  // ISO date
 * @property {ThesisStatus} status
 * @property {string} [fileUrl]         // Google Drive /view URL
 * @property {number} views
 * @property {number} downloads
 * @property {string} createdDate
 * @property {string} updatedDate
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {T[]} results
 * @property {number} count
 * @property {number} page
 * @property {number} pageSize
 * @property {number} totalPages
 * @template T
 */

/**
 * @typedef {Object} AuthUser
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} role
 */

/**
 * @typedef {Object} LoginResponse
 * @property {string} access
 * @property {string} refresh
 * @property {AuthUser} user
 */

/**
 * @typedef {Object} BulkUploadResult
 * @property {number} totalRows
 * @property {number} successful
 * @property {number} failed
 * @property {number} errorCount
 * @property {{row:number, field:string, error:string, suggestion?:string}[]} errors
 * @property {string} [errorReportUrl]
 */

/**
 * @typedef {Object} AnalyticsSummary
 * @property {number} totalPublished
 * @property {number} pendingReview
 * @property {number} totalViews
 * @property {number} totalDownloads
 * @property {number} drafts
 * @property {number} submitted
 * @property {number} approved
 * @property {number} rejected
 * @property {{date:string, submissions:number, publications:number, views:number, downloads:number}[]} trends
 * @property {{name:string, value:number}[]} departmentDistribution
 * @property {{name:string, value:number}[]} categoryDistribution
 * @property {{id:string,title:string,author:string,views:number,downloads:number}[]} trending
 * @property {{id:string,type:string,message:string,createdAt:string}[]} recentActivity
 */

/**
 * @typedef {Object} APIError
 * @property {string} message
 * @property {number} [status]
 * @property {Record<string,string[]>} [fields]
 */
