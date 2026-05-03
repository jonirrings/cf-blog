/**
 * i18n 单元测试
 */

import { describe, it, expect } from 'vitest';
import { translations, supportedLocales, defaultLocale } from '@cf-blog/i18n';

describe('i18n', () => {
  describe('translations', () => {
    it('should have zh-CN translations', () => {
      expect(translations['zh-CN']).toBeDefined();
      expect(translations['zh-CN']['nav.home']).toBe('首页');
      expect(translations['zh-CN']['nav.admin']).toBe('管理后台');
    });

    it('should have en translations', () => {
      expect(translations.en).toBeDefined();
      expect(translations.en['nav.home']).toBe('Home');
      expect(translations.en['nav.admin']).toBe('Admin');
    });

    it('should have consistent keys between locales', () => {
      const zhKeys = Object.keys(translations['zh-CN']);
      const enKeys = Object.keys(translations.en);

      expect(zhKeys.sort()).toEqual(enKeys.sort());
    });

    it('should have required navigation keys', () => {
      const requiredNavKeys = ['nav.home', 'nav.admin', 'nav.login', 'nav.logout', 'nav.register'];

      for (const key of requiredNavKeys) {
        expect(translations['zh-CN'][key]).toBeDefined();
        expect(translations.en[key]).toBeDefined();
      }
    });

    it('should have required post management keys', () => {
      const requiredPostKeys = [
        'post.title',
        'post.list',
        'post.management',
        'post.new',
        'post.edit',
        'post.delete',
        'post.deleteConfirm',
      ];

      for (const key of requiredPostKeys) {
        expect(translations['zh-CN'][key]).toBeDefined();
        expect(translations.en[key]).toBeDefined();
      }
    });

    it('should have required comment management keys', () => {
      const requiredCommentKeys = [
        'comment.title',
        'comment.management',
        'comment.status.pending',
        'comment.status.approved',
        'comment.status.rejected',
      ];

      for (const key of requiredCommentKeys) {
        expect(translations['zh-CN'][key]).toBeDefined();
        expect(translations.en[key]).toBeDefined();
      }
    });

    it('should have required user management keys', () => {
      const requiredUserKeys = [
        'user.title',
        'user.management',
        'user.role.admin',
        'user.role.publisher',
        'user.role.commenter',
      ];

      for (const key of requiredUserKeys) {
        expect(translations['zh-CN'][key]).toBeDefined();
        expect(translations.en[key]).toBeDefined();
      }
    });
  });

  describe('supportedLocales', () => {
    it('should have zh-CN and en', () => {
      expect(supportedLocales).toHaveLength(2);
      expect(supportedLocales.map(l => l.code)).toContain('zh-CN');
      expect(supportedLocales.map(l => l.code)).toContain('en');
    });

    it('should have valid locale structure', () => {
      for (const locale of supportedLocales) {
        expect(locale).toHaveProperty('code');
        expect(locale).toHaveProperty('name');
        expect(locale).toHaveProperty('flag');
      }
    });
  });

  describe('defaultLocale', () => {
    it('should be zh-CN', () => {
      expect(defaultLocale).toBe('zh-CN');
    });
  });
});
