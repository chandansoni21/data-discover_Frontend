
export const chatHistory = [
    // Finance
    { id: 'chat_fin_001', title: 'Q4 Revenue Analysis', domain: 'Financial Services', fileType: 'excel', lastMessage: '5 minutes ago', messages: 12, active: true },
    { id: 'chat_fin_002', title: 'Risk Assessment Report', domain: 'Financial Services', fileType: 'pdf', lastMessage: '2 days ago', messages: 8, active: false },
    { id: 'chat_fin_003', title: 'Investment Portfolio', domain: 'Financial Services', fileType: 'sql', lastMessage: '1 week ago', messages: 24, active: true },

    // Healthcare
    { id: 'chat_hlth_001', title: 'Patient Outcome Trends', domain: 'Healthcare', fileType: 'csv', lastMessage: '1 hour ago', messages: 15, active: true },
    { id: 'chat_hlth_002', title: 'Clinical Trial Results', domain: 'Healthcare', fileType: 'pdf', lastMessage: '3 days ago', messages: 6, active: false },

    // Retail
    { id: 'chat_ret_001', title: 'Black Friday Sales', domain: 'Retail & E-commerce', fileType: 'excel', lastMessage: '10 mins ago', messages: 32, active: true },
    { id: 'chat_ret_002', title: 'Customer Churn Analysis', domain: 'Retail & E-commerce', fileType: 'python', lastMessage: '1 day ago', messages: 11, active: false },

    // Manufacturing
    { id: 'chat_mfg_001', title: 'Supply Chain Optimization', domain: 'Manufacturing', fileType: 'sql', lastMessage: '2 hours ago', messages: 18, active: true },
    { id: 'chat_mfg_002', title: 'Equipment Maintenance Logs', domain: 'Manufacturing', fileType: 'txt', lastMessage: '5 days ago', messages: 9, active: false },

    // Education
    { id: 'chat_edu_001', title: 'Student Performance Metrics', domain: 'Education', fileType: 'csv', lastMessage: '30 mins ago', messages: 20, active: true },

    // Legal
    { id: 'chat_leg_001', title: 'Contract Compliance Review', domain: 'Legal Assistant', fileType: 'docx', lastMessage: '4 hours ago', messages: 14, active: true },
    { id: 'chat_leg_002', title: 'Case Precedent Search', domain: 'Legal Assistant', fileType: 'pdf', lastMessage: '6 days ago', messages: 5, active: false },
];

export const activeConversations = [
    // Finance
    { id: 'active_fin_001', title: 'Live Market Analysis', domain: 'Financial Services', fileType: 'excel', started: '10:30 AM', participants: 3, color: 'bg-gradient-to-r from-emerald-500 to-teal-600' },

    // Healthcare
    { id: 'active_hlth_001', title: 'Emergency Room Triage', domain: 'Healthcare', fileType: 'pdf', started: '11:15 AM', participants: 5, color: 'bg-gradient-to-r from-blue-500 to-indigo-600' },

    // Retail
    { id: 'active_ret_001', title: 'Inventory Restock Alert', domain: 'Retail & E-commerce', fileType: 'sql', started: '09:00 AM', participants: 2, color: 'bg-gradient-to-r from-orange-400 to-pink-600' },

    // Manufacturing
    { id: 'active_mfg_001', title: 'Factory Floor IoT Stream', domain: 'Manufacturing', fileType: 'json', started: '08:45 AM', participants: 4, color: 'bg-gradient-to-r from-slate-500 to-cyan-600' },
];

export const domainScenarios = {
    finance: [
        {
            type: 'user',
            text: 'What was the Q3 revenue breakdown by region?'
        },
        {
            type: 'bot',
            text: 'Based on the Q3 financial report, here is the revenue breakdown by region. North America continues to lead, showing a 15% YoY growth.\n\n| Region | Revenue ($M) | Growth (%) |\n|--------|-------------:|-----------:|\n| North America | 125.4 | +15.2% |\n| Europe | 84.1 | +5.8% |\n| Asia Pacific | 62.3 | +18.4% |\n| Latin America | 15.2 | +2.1% |\n\n**Key Insight:** Asia Pacific is the fastest-growing region despite simpler market conditions.',
            hasChart: true
        },
        {
            type: 'bot',
            text: 'Would you like to see a projection for Q4 based on these trends?',
            isFollowUp: true
        }
    ],
    healthcare: [
        {
            type: 'user',
            text: 'Show me the patient recovery rates for the new treatment protocol.'
        },
        {
            type: 'bot',
            text: 'Analyzing the clinical trial data... The new protocol (Protocol B) demonstrates a significant improvement in recovery times compared to the standard care (Protocol A).\n\n**Recovery Time Comparison (Days):**\n\n| Metric | Protocol A (Standard) | Protocol B (New) |\n|---|---|---|\n| Mean Recovery | 14.2 days | 9.8 days |\n| Median Recovery | 13.0 days | 9.0 days |\n| Readmission Rate | 12% | 4.5% |\n\nThe data indicates a **31% reduction** in recovery time.',
            hasChart: true
        }
    ],
    retail: [
        {
            type: 'user',
            text: 'Which product categories had the highest churn rate last month?'
        },
        {
            type: 'bot',
            text: 'I have analyzed the customer purchase history for last month. The content category with the highest churn is **Electronics Accessories**.\n\n| Category | Churn Rate | Avg. Order Value |\n|---|---|---|\n| Electronics Acc. | 8.4% | $45.20 |\n| Apparel | 3.2% | $68.50 |\n| Home Goods | 2.1% | $112.00 |\n\nHigh churn in Accessories seems correlated with shipping delays reported in region West.'
        }
    ],
    manufacturing: [
        {
            type: 'user',
            text: 'Identify the machines with the highest downtime this week.'
        },
        {
            type: 'bot',
            text: 'Top 5 machines by downtime hours for the current week:\n\n| Machine ID | Type | Downtime (Hrs) | Reason |\n|---|---|---|---|\n| CNC-04 | Milling | 12.5 | Tool Breakage |\n| PAY-02 | Assembly | 8.2 | Sensor Fault |\n| STAMP-01 | Stamping | 4.1 | Material Jam |\n\n**Recommendation:** Schedule preventive maintenance for CNC-04 immediately.'
        }
    ],
    education: [
        {
            type: 'user',
            text: 'Compare math scores between Grade 9 and Grade 10.'
        },
        {
            type: 'bot',
            text: 'Here is the comparison of average Math scores:\n\n| Grade | Avg Score | Pass Rate |\n|---|---|---|\n| Grade 9 | 76.4 | 88% |\n| Grade 10 | 72.1 | 82% |\n\nThere is a noticeable dip in Grade 10 performance, particularly in the Algebra module.'
        }
    ],
    legal: [
        {
            type: 'user',
            text: 'List all clauses related to "Termination" in theuploaded contracts.'
        },
        {
            type: 'bot',
            text: 'I found 3 distinct termination clauses across the documents:\n\n1. **Employment Agreement (Section 4.1):** Termination for Cause - requires 15 days notice.\n2. **Vendor Contract (Clause 12):** Mutual Termination - 30 days written notice required.\n3. **NDA (Para 6):** Termination does not affect confidentiality obligations for 5 years.\n\nWould you like me to draft a summary comparison?'
        }
    ]
};
