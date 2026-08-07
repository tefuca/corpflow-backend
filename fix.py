#!/usr/bin/env python3
import os
import re

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, "src")

def read(p):
    with open(p, "r", encoding="utf-8") as fh:
        return fh.read()

def write(p, c):
    with open(p, "w", encoding="utf-8") as fh:
        fh.write(c)

def fix_auth():
    for root, dirs, files in os.walk(os.path.join(SRC, "modules")):
        for file in files:
            if not file.endswith(".ts"):
                continue
            fp = os.path.join(root, file)
            c = read(fp)
            orig = c
            c = c.replace("../../modules/auth/", "../../auth/")
            c = c.replace("../modules/auth/", "../auth/")
            c = c.replace("../../modules/rbac/", "../../rbac/")
            c = c.replace("../modules/rbac/", "../rbac/")
            if c != orig:
                write(fp, c)
                print("Fixed auth:", fp)

def fix_entities():
    reps = [
        ("../activities/entities/", "../activity/entities/"),
        ("../../activities/entities/", "../activity/entities/"),
        ("../payments/entities/", "../payment/entities/"),
        ("../../payments/entities/", "../payment/entities/"),
        ("../budgets/entities/", "../budget/entities/"),
        ("../../budgets/entities/", "../budget/entities/"),
        ("../assets/entities/", "../asset/entities/"),
        ("../../assets/entities/", "../asset/entities/"),
        ("../executions/entities/", "../execution/entities/"),
        ("../../executions/entities/", "../execution/entities/"),
        ("../projects/entities/", "../project/entities/"),
        ("../../projects/entities/", "../project/entities/"),
        ("../inventory/entities/", "../stock/entities/"),
        ("../../inventory/entities/", "../stock/entities/"),
        ("../fixed-assets/entities/", "../fixed-asset/entities/"),
        ("../../fixed-assets/entities/", "../fixed-asset/entities/"),
        ("../audit-logs/", "../audit-log/"),
        ("../../audit-logs/", "../../audit-log/"),
    ]
    for root, dirs, files in os.walk(os.path.join(SRC, "modules")):
        for file in files:
            if not file.endswith(".ts"):
                continue
            fp = os.path.join(root, file)
            c = read(fp)
            orig = c
            for old, new in reps:
                c = c.replace("from " + chr(34) + old, "from " + chr(34) + new)
                c = c.replace("from " + chr(39) + old, "from " + chr(39) + new)
            if c != orig:
                write(fp, c)
                print("Fixed entity:", fp)

def fix_app():
    p = os.path.join(SRC, "app.module.ts")
    if not os.path.exists(p): return
    c = read(p)
    c = c.replace("InventoryModule", "StockModule")
    c = c.replace("FixedAssetsModule", "FixedAssetModule")
    c = c.replace("ActivityModule", "ActivitiesModule")
    c = c.replace("BudgetModule", "BudgetsModule")
    c = c.replace("ExecutionModule", "ExecutionsModule")
    # Remove broken imports
    lines = c.split("\n")
    new_lines = []
    for line in lines:
        if "modules/inventory/inventory.module" in line:
            continue
        if "modules/fixed-assets/fixed-assets.module" in line:
            continue
        if "modules/document/document.module" in line:
            continue
        if "AssetModule" in line and "import" in line:
            continue
        new_lines.append(line)
    c = "\n".join(new_lines)
    # Remove AssetModule from imports array
    c = c.replace("    AssetModule,\n", "")
    c = c.replace("    AssetModule\n", "")
    write(p, c)
    print("Fixed app.module.ts")

def dedup_entity(fp):
    if not os.path.exists(fp): return
    c = read(fp)
    lines = c.split("\n")
    new_lines = []
    seen = set()
    for line in lines:
        s = line.strip()
        if s.startswith("@Column") or s.startswith("@OneToMany") or s.startswith("@ManyToOne") or s.startswith("@CreateDateColumn") or s.startswith("@UpdateDateColumn"):
            if s in seen:
                continue
            seen.add(s)
        new_lines.append(line)
    write(fp, "\n".join(new_lines))
    print("Deduped:", fp)

def fix_all_entities():
    dedup_entity(os.path.join(SRC, "modules", "project", "entities", "project.entity.ts"))
    dedup_entity(os.path.join(SRC, "modules", "asset", "entities", "asset.entity.ts"))
    dedup_entity(os.path.join(SRC, "modules", "budget", "entities", "budget.entity.ts"))
    dedup_entity(os.path.join(SRC, "modules", "activity", "entities", "activity.entity.ts"))
    dedup_entity(os.path.join(SRC, "modules", "payment", "entities", "payment.entity.ts"))
    dedup_entity(os.path.join(SRC, "modules", "execution", "entities", "execution.entity.ts"))

def create_seed():
    d = os.path.join(SRC, "modules", "rbac", "services")
    os.makedirs(d, exist_ok=True)
    c = "import { Injectable } from " + chr(39) + "@nestjs/common" + chr(39) + ";\n"
    c += "import { RbacService } from " + chr(39) + "./rbac.service" + chr(39) + ";\n\n"
    c += "@Injectable()\n"
    c += "export class SeedService {\n"
    c += "  constructor(private readonly rbacService: RbacService) {}\n"
    c += "  async seedSystemFunctions() {\n"
    c += "    return this.rbacService.seedSystemFunctions();\n"
    c += "  }\n"
    c += "}\n"
    write(os.path.join(d, "seed.service.ts"), c)
    print("Created seed.service.ts")

def fix_rbac():
    p = os.path.join(SRC, "modules", "rbac", "rbac.module.ts")
    if not os.path.exists(p): return
    c = read(p)
    if "SeedService" not in c:
        c = c.replace("import { RbacService } from " + chr(39) + "./services/rbac.service" + chr(39) + ";",
                    "import { RbacService } from " + chr(39) + "./services/rbac.service" + chr(39) + ";\nimport { SeedService } from " + chr(39) + "./services/seed.service" + chr(39) + ";")
        c = c.replace("providers: [RbacService, PermissionGuard]", "providers: [RbacService, PermissionGuard, SeedService]")
        c = c.replace("exports: [RbacService, PermissionGuard]", "exports: [RbacService, PermissionGuard, SeedService]")
        write(p, c)
        print("Fixed rbac.module.ts")

def fix_controllers():
    files = [
        os.path.join(SRC, "modules", "agent", "controllers", "training-module.controller.ts"),
        os.path.join(SRC, "modules", "agent", "controllers", "kpi-definition.controller.ts"),
        os.path.join(SRC, "modules", "agent", "controllers", "commission-rate.controller.ts"),
    ]
    for fp in files:
        if not os.path.exists(fp): continue
        c = read(fp)
        c = c.replace("body: DTO", "body: any")
        c = c.replace("ParseIntPipe", "ParseUUIDPipe")
        c = c.replace("id: number", "id: string")
        write(fp, c)
        print("Fixed controller:", fp)

def fix_costing():
    p = os.path.join(SRC, "modules", "project", "services", "project-costing.service.ts")
    if not os.path.exists(p): return
    c = read(p)
    c = c.replace("../stock/entities/stock-issue.entity", "../../stock/entities/stock-issue.entity")
    c = c.replace("../fixed-asset/entities/asset-allocation.entity", "../../fixed-asset/entities/asset-allocation.entity")
    write(p, c)
    print("Fixed project-costing.service.ts")

def fix_depreciation():
    p = os.path.join(SRC, "modules", "fixed-asset", "services", "depreciation.service.ts")
    if not os.path.exists(p): return
    c = read(p)
    c = c.replace("../entities/asset.entity", "../../asset/entities/asset.entity")
    write(p, c)
    print("Fixed depreciation.service.ts")

if __name__ == "__main__":
    print("=== CorpFlow Fix Script ===")
    fix_auth()
    fix_entities()
    fix_app()
    fix_all_entities()
    create_seed()
    fix_rbac()
    fix_controllers()
    fix_costing()
    fix_depreciation()
    print("=== Done! Run: npx tsc --noEmit ===")
