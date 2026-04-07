# Onboarding & Settings Feature Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended)

**Goal:** 迁移 Onboarding 和 Settings 到 features 目录

---

## Task 1: 迁移 Welcome → features/onboarding

**Files to migrate:**
```
components/welcome/ → features/onboarding/
├── Wizard.tsx
├── index.ts
└── steps/
    ├── AgentStep.tsx
    ├── ProviderStep.tsx
    ├── ReadyStep.tsx
    ├── VaultStep.tsx
    └── WelcomeStep.tsx
```

- [ ] **Step 1: 创建目录结构**
- [ ] **Step 2: 复制文件到新位置**
- [ ] **Step 3: 更新 features/index.ts**
- [ ] **Step 4: 更新路由导入**
- [ ] **Step 5: 验证 TypeScript + Linter**
- [ ] **Step 6: 删除旧文件**

---

## Task 2: 迁移 Settings → features/settings

**Files to migrate:**
```
components/settings/ → features/settings/
├── SettingsContent.tsx
├── SettingsNav.tsx
├── SettingsSection.tsx
└── index.ts
```

- [ ] **Step 1: 创建目录结构**
- [ ] **Step 2: 复制文件到新位置**
- [ ] **Step 3: 更新 features/index.ts**
- [ ] **Step 4: 验证 TypeScript + Linter**
- [ ] **Step 5: 删除旧文件**

---

## 实施检查清单

- [ ] Onboarding 在 `features/onboarding/`
- [ ] Settings 在 `features/settings/`
- [ ] 路由导入已更新
- [ ] TypeScript 检查通过
- [ ] Linter 检查通过
- [ ] 旧文件已删除
