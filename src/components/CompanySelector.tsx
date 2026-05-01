import { useState } from 'react';
import { COMPANY_PROFILES, CompanyProfile, CompanyType } from '../lib/companySelector';

interface CompanySelectorProps {
  onCompanySelect: (companyId: CompanyType) => void;
  selectedCompany?: CompanyType;
}

export default function CompanySelector({ onCompanySelect, selectedCompany }: CompanySelectorProps) {
  const [hoveredCompany, setHoveredCompany] = useState<CompanyType | null>(null);

  const handleSelect = (company: CompanyProfile) => {
    onCompanySelect(company.id);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Select Your Training Company
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Choose the company you want to practice B2B sales conversations for
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {COMPANY_PROFILES.map((company) => {
          const isSelected = selectedCompany === company.id;
          const isHovered = hoveredCompany === company.id;
          
          return (
            <div
              key={company.id}
              onClick={() => handleSelect(company)}
              onMouseEnter={() => setHoveredCompany(company.id)}
              onMouseLeave={() => setHoveredCompany(null)}
              className={`
                relative cursor-pointer rounded-2xl p-6 transition-all duration-300
                border-2 transform hover:scale-105
                ${isSelected 
                  ? 'border-blue-500 shadow-2xl scale-105' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }
                ${isHovered && !isSelected ? 'shadow-xl' : ''}
              `}
              style={{
                backgroundColor: isSelected ? `${company.color}10` : undefined,
                borderColor: isSelected ? company.color : undefined,
              }}
            >
              {/* Selected Indicator */}
              {isSelected && (
                <div 
                  className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: company.color }}
                >
                  ✓
                </div>
              )}

              {/* Company Header */}
              <div className="flex items-start gap-4 mb-4">
                <div 
                  className="text-5xl p-3 rounded-xl"
                  style={{ backgroundColor: `${company.color}20` }}
                >
                  {company.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {company.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {company.domain}
                  </p>
                  <div 
                    className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: company.color }}
                  >
                    {company.industry}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm leading-relaxed">
                {company.description}
              </p>

              {/* Key Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    LOCATION
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {company.location}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    WEBSITE
                  </div>
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {company.website}
                  </div>
                </div>
              </div>

              {/* Target Clients */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Target Clients
                </h4>
                <div className="flex flex-wrap gap-2">
                  {company.targetClients.slice(0, 3).map((client, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
                    >
                      {client}
                    </span>
                  ))}
                  {company.targetClients.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                      +{company.targetClients.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Pain Points (Preview) */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Key Pain Points
                </h4>
                <ul className="space-y-1">
                  {company.painPoints.slice(0, 2).map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="text-red-500 mt-0.5">⚠</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Solutions (Preview) */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Our Solutions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {company.solutions.slice(0, 2).map((solution, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{ 
                        backgroundColor: `${company.color}20`,
                        color: company.color 
                      }}
                    >
                      {solution}
                    </span>
                  ))}
                </div>
              </div>

              {/* Select Button */}
              <button
                className={`
                  w-full mt-6 py-3 px-6 rounded-xl font-semibold text-white
                  transition-all duration-300 transform
                  ${isSelected ? 'scale-105' : 'hover:scale-105'}
                `}
                style={{ 
                  backgroundColor: isSelected ? company.color : `${company.color}80`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(company);
                }}
              >
                {isSelected ? '✓ Selected - Continue Training' : `Select ${company.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      {selectedCompany && (
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Training Focus: {COMPANY_PROFILES.find(c => c.id === selectedCompany)?.name}
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You'll practice B2B sales conversations with decision-makers from this company. 
                Voice agents will use human-like voices (Gemini 3.1 Flash TTS - FREE) to simulate 
                realistic prospects like HR Managers, Business Owners, and Finance Directors.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
