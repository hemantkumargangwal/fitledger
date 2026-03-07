import React from 'react';

const CardSkeleton = () => (
  <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse-soft">
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-gray-200 rounded-xl shimmer"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 shimmer"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 shimmer"></div>
      </div>
    </div>
  </div>
);

const TableSkeleton = ({ rows = 5 }) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-scale-in">
    <div className="p-6 border-b border-gray-200">
      <div className="h-6 bg-gray-200 rounded w-1/3 shimmer"></div>
    </div>
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-6 animate-pulse-soft" style={{ animationDelay: `${i * 100}ms` }}>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full shimmer"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 shimmer"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3 shimmer"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/6 shimmer"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6 shimmer"></div>
            <div className="h-6 bg-gray-200 rounded w-16 shimmer"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const StatsCardSkeleton = () => (
  <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse-soft group hover:shadow-soft-lg transition-all duration-300">
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-gray-200 rounded-xl shimmer group-hover:scale-110 transition-transform duration-300"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2 shimmer"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 shimmer"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4 mt-2 shimmer"></div>
      </div>
    </div>
  </div>
);

const ChartSkeleton = ({ height = 300 }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200 animate-scale-in">
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 rounded w-1/4 shimmer"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 shimmer"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded w-20 shimmer"></div>
    </div>
    <div className="h-64 bg-gray-200 rounded-lg shimmer"></div>
  </div>
);

const PieChartSkeleton = () => (
  <div className="bg-white rounded-xl p-6 border border-gray-200 animate-scale-in">
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 rounded w-1/3 shimmer"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 shimmer"></div>
      </div>
      <div className="w-5 h-5 bg-gray-200 rounded shimmer"></div>
    </div>
    <div className="h-64 bg-gray-200 rounded-full mx-auto w-64 shimmer"></div>
    <div className="mt-4 space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between animate-pulse-soft" style={{ animationDelay: `${i * 150}ms` }}>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-200 rounded-full shimmer"></div>
            <div className="h-4 bg-gray-200 rounded w-16 shimmer"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-8 shimmer"></div>
        </div>
      ))}
    </div>
  </div>
);

const DashboardSkeleton = () => (
  <div className="space-y-8 p-6 animate-fade-in">
    {/* Header Skeleton */}
    <div className="animate-pulse-soft">
      <div className="h-10 bg-gray-200 rounded w-1/4 mb-2 shimmer"></div>
      <div className="h-5 bg-gray-200 rounded w-1/2 shimmer"></div>
    </div>

    {/* Stats Cards Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
          <StatsCardSkeleton />
        </div>
      ))}
    </div>

    {/* Charts Row */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
        <ChartSkeleton />
      </div>
      <div className="animate-slide-up" style={{ animationDelay: '600ms' }}>
        <PieChartSkeleton />
      </div>
    </div>

    {/* Recent Activity Table */}
    <div className="animate-slide-up" style={{ animationDelay: '800ms' }}>
      <TableSkeleton rows={3} />
    </div>
  </div>
);

const MembersPageSkeleton = () => (
  <div className="space-y-8 p-6 animate-fade-in">
    {/* Header Skeleton */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="animate-pulse-soft">
        <div className="h-10 bg-gray-200 rounded w-1/3 mb-2 shimmer"></div>
        <div className="h-5 bg-gray-200 rounded w-1/2 shimmer"></div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-10 bg-gray-200 rounded w-24 shimmer"></div>
        <div className="h-10 bg-gray-200 rounded w-32 shimmer"></div>
      </div>
    </div>

    {/* Stats Overview */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
          <StatsCardSkeleton />
        </div>
      ))}
    </div>

    {/* Filters */}
    <div className="animate-pulse-soft">
      <div className="h-20 bg-gray-200 rounded-xl shimmer"></div>
    </div>

    {/* Members Table */}
    <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
      <TableSkeleton rows={5} />
    </div>
  </div>
);

const PaymentsPageSkeleton = () => (
  <div className="space-y-8 p-6 animate-fade-in">
    {/* Header Skeleton */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="animate-pulse-soft">
        <div className="h-10 bg-gray-200 rounded w-1/4 mb-2 shimmer"></div>
        <div className="h-5 bg-gray-200 rounded w-1/2 shimmer"></div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-10 bg-gray-200 rounded w-20 shimmer"></div>
        <div className="h-10 bg-gray-200 rounded w-32 shimmer"></div>
      </div>
    </div>

    {/* Revenue Summary Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
          <StatsCardSkeleton />
        </div>
      ))}
    </div>

    {/* Payment Type Breakdown */}
    <div className="animate-pulse-soft">
      <div className="h-32 bg-gray-200 rounded-xl shimmer"></div>
    </div>

    {/* Filters */}
    <div className="animate-pulse-soft">
      <div className="h-16 bg-gray-200 rounded-xl shimmer"></div>
    </div>

    {/* Payments Table */}
    <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
      <TableSkeleton rows={5} />
    </div>
  </div>
);

const ButtonSkeleton = ({ width = 'w-20', height = 'h-10' }) => (
  <div className={`${width} ${height} bg-gray-200 rounded-lg shimmer animate-pulse-soft`}></div>
);

const InputSkeleton = ({ width = 'w-full' }) => (
  <div className={`${width} h-10 bg-gray-200 rounded-lg shimmer animate-pulse-soft`}></div>
);

const AvatarSkeleton = ({ size = 'w-10 h-10' }) => (
  <div className={`${size} bg-gray-200 rounded-full shimmer animate-pulse-soft`}></div>
);

export {
  CardSkeleton,
  TableSkeleton,
  StatsCardSkeleton,
  ChartSkeleton,
  PieChartSkeleton,
  DashboardSkeleton,
  MembersPageSkeleton,
  PaymentsPageSkeleton,
  ButtonSkeleton,
  InputSkeleton,
  AvatarSkeleton
};
