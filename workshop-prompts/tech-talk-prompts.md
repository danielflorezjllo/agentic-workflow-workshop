# Tech Talk

There’s a principle in aviation called the 𝟏 𝐢𝐧 𝟔𝟎 𝐫𝐮𝐥𝐞 ✈️ - it says that for every 1 degree of heading error, a pilot will drift 1 nautical mile off course after 60 nautical miles.

That tiny deviation compounds over distance until you’re nowhere near where you intended to land

![1-in-60-rule.png](Tech%20Talk/1-in-60-rule.png)

- The 8 Levels of Agentic Engineering: https://www.bassimeledath.com/blog/levels-of-agentic-engineering
- Skill Issue: Harness Engineering for Coding Agents: https://www.humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents
- Harness engineering: leveraging Codex in an agent-first world: https://openai.com/index/harness-engineering/

![levels.png](Tech%20Talk/levels.png)

![Agentic Development Workflow.jpg](Tech%20Talk/Agentic_Development_Workflow.jpg)

# Research

/prime

Please analyze the product catalog page in the app folder end-to-end and explain how frontend and backend integrate. Identify the main files involved, the request/response flow, and the coding patterns/conventions used (data fetching, state management, services, validation, errors, pagination/filtering)

# Vibe Planning (Agent-Orchestrated Research)

![sub-agents.png](Tech%20Talk/sub-agents.png)


The goal is to explore multiple architectural approaches before implementation by delegating research to specialized sub-agents.

---

Spin up three sub-agents in parallel to research and propose solutions for the following tasks.


# Sub-Agents

## 1. Front-End Sub-Agent
Investigate possible approaches for implementing the required functionality on the front end.

## 2. Back-End Sub-Agent
Investigate possible approaches for implementing the required functionality on the back end.

## 3. Filters Best Practices Sub-Agent
Research industry best practices for designing and implementing filters, including considerations for:

- User experience (UX)
- Performance
- Scalability
- Maintainability

# Research Requirements

Each sub-agent should propose **at least two viable approaches** within their area of responsibility.

For every approach identified, include:

- A clear explanation of the approach
- Pros and cons
- Trade-offs or risks
- When the approach is most appropriate

# Final Synthesis

After all sub-agents complete their research, synthesize the findings into a final section that includes:

- A **recommended approach**
- The **reasoning behind the recommendation**
- Any important **architectural or implementation considerations**

Tasks

# [FEAT-1234] Add Product Filtering to Catalog API

## Description

Users need to filter and search products in the catalog API. Currently `GET /api/products` returns all 30 products without filtering capabilities.

## Requirements

Add filtering and search capabilities to `GET /api/products`:

- **Price filtering**: Support minimum and maximum price filters
- **Category filtering**: Allow filtering by product category
- **Keyword search**: Search product names and descriptions
- **Sorting**: Enable sorting by price or name (both directions)

All filters should be optional and work together when combined.

## Acceptance Criteria

- [ ] All filtering tests pass
- [ ] Invalid inputs return appropriate HTTP 400 errors
- [ ] Backwards compatible (no filters = all products)
- [ ] Follows existing code patterns and conventions

## Technical Notes

- Validate query parameters
- Use appropriate types for monetary values
- Log filter operations

## Definition of Done

- All acceptance criteria met
- All Tests passing
  `uv run pytest`

# [FEAT-1235] Add Product Filtering UI to Frontend

## Description

Backend filtering capabilities are now available on `GET /api/products` with query parameters. Users need a frontend interface to interact with these filters and see filtered results.

## Requirements

Build a product filtering interface that connects to the backend filtering API:

- **Price range controls**: Allow users to set minimum and maximum price filters
- **Category selector**: Enable filtering by product category
- **Search input**: Provide keyword search for product names and descriptions
- **Sort controls**: Allow users to sort results by price or name
- **Filter management**: Provide ability to apply and clear filters

The interface should handle loading states, empty results, and validation errors appropriately.

## Acceptance Criteria

- [ ] Price filtering interface works and sends correct query parameters
- [ ] Category selection filters products correctly
- [ ] Search input filters products by keyword
- [ ] Sort options reorder products as expected
- [ ] Multiple filters work together (combined filtering)
- [ ] Clear filters returns to showing all products
- [ ] Validation errors are displayed to users
- [ ] Empty state shown when no products match filters
- [ ] Loading state shown during filter operations
- [ ] All filter interactions logged to console (structured JSON)

# Implementation plan

/plan-feature

Based on the recommended approach, the research results, and the tasks below, create a detailed implementation plan.

You must validate the implementation using the Agent-Browser (Use Playwright MCP if Agent-Browser is not available or cannot be installed).

Tasks

# [FEAT-1234] Add Product Filtering to Catalog API

## Description

Users need to filter and search products in the catalog API. Currently `GET /api/products` returns all 30 products without filtering capabilities.

## Requirements

Add filtering and search capabilities to `GET /api/products`:

- **Price filtering**: Support minimum and maximum price filters
- **Category filtering**: Allow filtering by product category
- **Keyword search**: Search product names and descriptions
- **Sorting**: Enable sorting by price or name (both directions)

All filters should be optional and work together when combined.

## Acceptance Criteria

- [ ] All filtering tests pass
- [ ] Invalid inputs return appropriate HTTP 400 errors
- [ ] Backwards compatible (no filters = all products)
- [ ] Follows existing code patterns and conventions

## Technical Notes

- Validate query parameters
- Use appropriate types for monetary values
- Log filter operations

## Definition of Done

- All acceptance criteria met
- All Tests passing
  `uv run pytest`

# [FEAT-1235] Add Product Filtering UI to Frontend

## Description

Backend filtering capabilities are now available on `GET /api/products` with query parameters. Users need a frontend interface to interact with these filters and see filtered results.

## Requirements

Build a product filtering interface that connects to the backend filtering API:

- **Price range controls**: Allow users to set minimum and maximum price filters
- **Category selector**: Enable filtering by product category
- **Search input**: Provide keyword search for product names and descriptions
- **Sort controls**: Allow users to sort results by price or name
- **Filter management**: Provide ability to apply and clear filters

The interface should handle loading states, empty results, and validation errors appropriately.

## Acceptance Criteria

- [ ] Price filtering interface works and sends correct query parameters
- [ ] Category selection filters products correctly
- [ ] Search input filters products by keyword
- [ ] Sort options reorder products as expected
- [ ] Multiple filters work together (combined filtering)
- [ ] Clear filters returns to showing all products
- [ ] Validation errors are displayed to users
- [ ] Empty state shown when no products match filters
- [ ] Loading state shown during filter operations
- [ ] All filter interactions logged to console (structured JSON)

## Technical Notes

- Update API client to accept filter parameters
- Build query string from filter values
- Use React Hook Form and Zod for form validation
- Follow existing logging patterns (structured JSON)
- Use existing shadcn components where possible

## Definition of Done

- All acceptance criteria met
- Backend API called with correct query parameters
- Follows existing code patterns and conventions
- Manual testing checklist completed

## Success Criteria

You've completed the exercise when:

- ✅ All backend tests pass (`uv run pytest`)
- ✅ Backend API accepts and processes filter parameters correctly
- ✅ Frontend displays a working filter interface
- ✅ Filters can be applied and results update accordingly
- ✅ You can manually test the full filtering flow in the browser

# Commit the plan so it can be shared with the team later (you can also reset to the plan if something goes wrong, or have different agents implementing the same plan)

Commit the implementation plan only

# EXECUTE

## Local

/execute Implement the plan defined in `implement-product-filtering.md`. [implement-product-filtering.md](http://implement-product-filtering.md/)

You must use agent-browser to validate the frontend implementation (Use Playwright MCP if Agent-Browser is not available or can't be installed).

## Remote

Follow the instructions in the skill .agents/skills/execute/SKILL.md and implement the plan defined in .agents/plan/implement-product-filtering.md.

You must use agent-browser to validate the frontend implementation (Use Playwright MCP if Agent-Browser is not available or can't be installed).


# **Feeback**

When a filter is changed, the page shows a small visual flicker. It feels as if there is a full re-render or a partial refresh happening, which affects the overall experience.

It doesn’t break functionality, but it does create a sense of instability in the UI. It would be worth reviewing whether the state is triggering an unnecessary re-render or if the layout is being recalculated more than expected.

# Remove the plan (it's already on commit history)

Remove the implementation plan md file

# What's next? 

Our North start needs to be Harness Engineering.

![parallel.png](Tech%20Talk/parallel.png)

